// 데이트피커 — date-input 달력 버튼 클릭 시 calendar 팝업에서 날짜 선택
// 접근성: 트리거 aria-expanded/aria-controls, roving tabindex,
// 화살표(일)·PageUp/Down(월)·Home/End(주) 이동, Esc 닫기 + 트리거 포커스 복귀
;(function () {
  'use strict'

  var WEEKDAYS = [
    { abbr: '일요일', label: '일' },
    { abbr: '월요일', label: '월' },
    { abbr: '화요일', label: '화' },
    { abbr: '수요일', label: '수' },
    { abbr: '목요일', label: '목' },
    { abbr: '금요일', label: '금' },
    { abbr: '토요일', label: '토' }
  ]

  var idSeq = 0

  function pad(n) { return (n < 10 ? '0' : '') + n }

  function formatDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
  }

  function sameDate(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  // input 값에서 날짜부(YYYY-MM-DD)만 파싱 — 시간부는 pick()에서 보존
  function parseInputDate(value) {
    var m = /(\d{4})-(\d{2})-(\d{2})/.exec(value || '')
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null
  }

  function setup(root) {
    var field = root.querySelector('.date-input__field')
    var btn = root.querySelector('.date-input__btn')
    if (!field || !btn) return

    // data-default-now — 페이지 진입 시 날짜부를 오늘, 시간부를 현재 시각으로 초기화
    if (field.hasAttribute('data-default-now')) {
      var now = new Date()
      var initial = field.value
      var todayStr = formatDate(now)
      initial = /\d{4}-\d{2}-\d{2}/.test(initial)
        ? initial.replace(/\d{4}-\d{2}-\d{2}/, todayStr)
        : todayStr
      // 값에 시간부가 있는 형식일 때만 현재 시각으로 교체 (날짜 전용 필드는 그대로)
      if (/\d{1,2}:\d{2}/.test(initial)) {
        initial = initial.replace(/\d{1,2}:\d{2}/, pad(now.getHours()) + ':' + pad(now.getMinutes()))
      }
      field.value = initial
    }

    // data-min-today — 오늘 이전 날짜는 선택 불가(버튼 disabled + 키보드 이동 클램프)
    var minToday = field.hasAttribute('data-min-today')

    function todayStart() {
      var t = new Date()
      return new Date(t.getFullYear(), t.getMonth(), t.getDate())
    }

    // 최소 선택일보다 앞이면 최소일로 보정
    function clampToMin(d) {
      if (!minToday) return d
      var min = todayStart()
      return d < min ? min : d
    }

    // 팝업 스켈레톤 — head(내비)는 유지하고 제목/그리드 본문만 다시 그린다
    var popup = document.createElement('div')
    popup.className = 'calendar date-input__popup'
    popup.setAttribute('role', 'application')
    popup.setAttribute('aria-label', '날짜 선택')
    popup.id = field.id ? field.id + '-calendar' : 'date-input-popup-' + (++idSeq)
    popup.hidden = true

    var theadCells = WEEKDAYS.map(function (w) {
      return '<th scope="col" abbr="' + w.abbr + '">' + w.label + '</th>'
    }).join('')

    popup.innerHTML =
      '<div class="calendar__head">' +
        '<button type="button" class="calendar__nav" data-cal-nav="-1" aria-label="이전 달">&lsaquo;</button>' +
        '<h2 class="calendar__title" aria-live="polite"></h2>' +
        '<button type="button" class="calendar__nav" data-cal-nav="1" aria-label="다음 달">&rsaquo;</button>' +
      '</div>' +
      '<table class="calendar__grid" role="grid">' +
        '<thead><tr>' + theadCells + '</tr></thead>' +
        '<tbody></tbody>' +
      '</table>'

    root.appendChild(popup)

    var title = popup.querySelector('.calendar__title')
    var tbody = popup.querySelector('tbody')

    btn.setAttribute('aria-expanded', 'false')
    btn.setAttribute('aria-controls', popup.id)

    var view = { y: 0, m: 0 }  // 표시 중인 연/월
    var active = null          // 키보드 포커스 기준 날짜

    function render() {
      var today = new Date()
      var sel = parseInputDate(field.value)
      title.textContent = view.y + '년 ' + (view.m + 1) + '월'

      // 표시 달 1일이 속한 주의 일요일부터 6주(42칸)
      var startDow = new Date(view.y, view.m, 1).getDay()
      var cursor = new Date(view.y, view.m, 1 - startDow)
      var rows = ''
      for (var w = 0; w < 6; w++) {
        rows += '<tr role="row">'
        for (var i = 0; i < 7; i++) {
          var isOther = cursor.getMonth() !== view.m
          var isToday = sameDate(cursor, today)
          var isSel = !!sel && sameDate(cursor, sel)
          var isActive = !!active && sameDate(cursor, active)
          var isPast = minToday && cursor < todayStart()
          var cls = 'calendar__day' +
            (isOther ? ' calendar__day--other-month' : '') +
            (isToday ? ' calendar__day--today' : '') +
            (isSel ? ' calendar__day--selected' : '')
          var label = cursor.getFullYear() + '년 ' + (cursor.getMonth() + 1) + '월 ' + cursor.getDate() + '일' +
            (isToday ? ' (오늘)' : '') + (isSel ? ' (선택됨)' : '') + (isPast ? ' (선택 불가)' : '')
          rows += '<td role="gridcell">' +
            '<button type="button" class="' + cls + '"' +
              (isSel ? ' aria-selected="true"' : '') +
              (isPast ? ' disabled' : '') +
              ' data-cal-date="' + formatDate(cursor) + '"' +
              ' tabindex="' + (isActive ? '0' : '-1') + '"' +
              ' aria-label="' + label + '">' + cursor.getDate() + '</button>' +
            '</td>'
          cursor.setDate(cursor.getDate() + 1)
        }
        rows += '</tr>'
      }
      tbody.innerHTML = rows

      // 오늘이 속한 달 이전으로는 이동 불가
      if (minToday) {
        var min = todayStart()
        popup.querySelector('[data-cal-nav="-1"]').disabled =
          view.y < min.getFullYear() ||
          (view.y === min.getFullYear() && view.m <= min.getMonth())
      }
    }

    function focusActive() {
      var el = tbody.querySelector('.calendar__day[tabindex="0"]')
      if (el) el.focus()
    }

    function open() {
      var base = parseInputDate(field.value) || new Date()
      base = clampToMin(new Date(base.getFullYear(), base.getMonth(), base.getDate()))
      view.y = base.getFullYear()
      view.m = base.getMonth()
      active = base
      render()
      popup.hidden = false
      btn.setAttribute('aria-expanded', 'true')
      focusActive()
    }

    function close(focusBack) {
      popup.hidden = true
      btn.setAttribute('aria-expanded', 'false')
      if (focusBack) btn.focus()
    }

    // 키보드 이동 목적지로 활성 날짜 변경 — 달이 바뀌면 뷰도 따라간다
    function setActive(d) {
      active = d
      view.y = d.getFullYear()
      view.m = d.getMonth()
      render()
      focusActive()
    }

    // 날짜 확정 — 값의 날짜부만 교체해 시간부("18:00" 등)는 보존
    function pick(dateStr) {
      var v = field.value
      field.value = /\d{4}-\d{2}-\d{2}/.test(v) ? v.replace(/\d{4}-\d{2}-\d{2}/, dateStr) : dateStr
      field.dispatchEvent(new Event('change', { bubbles: true }))
      close(true)
    }

    btn.addEventListener('click', function () {
      if (popup.hidden) open()
      else close(true)
    })

    popup.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-cal-nav]')
      if (nav) {
        var moved = new Date(view.y, view.m + +nav.getAttribute('data-cal-nav'), 1)
        view.y = moved.getFullYear()
        view.m = moved.getMonth()
        // 활성 날짜를 새 달로 이동(말일 초과분은 말일로 보정, 최소일 이전은 보정)
        var last = new Date(view.y, view.m + 1, 0).getDate()
        active = clampToMin(new Date(view.y, view.m, Math.min(active ? active.getDate() : 1, last)))
        render()
        return
      }
      var day = e.target.closest('[data-cal-date]')
      if (day) pick(day.getAttribute('data-cal-date'))
    })

    popup.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        close(true)
        return
      }
      if (!e.target.closest('[data-cal-date]')) return

      var next = new Date(active)
      if (e.key === 'ArrowLeft') next.setDate(next.getDate() - 1)
      else if (e.key === 'ArrowRight') next.setDate(next.getDate() + 1)
      else if (e.key === 'ArrowUp') next.setDate(next.getDate() - 7)
      else if (e.key === 'ArrowDown') next.setDate(next.getDate() + 7)
      else if (e.key === 'PageUp') next.setMonth(next.getMonth() - 1)
      else if (e.key === 'PageDown') next.setMonth(next.getMonth() + 1)
      else if (e.key === 'Home') next.setDate(next.getDate() - next.getDay())
      else if (e.key === 'End') next.setDate(next.getDate() + (6 - next.getDay()))
      else return

      e.preventDefault()
      setActive(clampToMin(next))
    })

    // 팝업 밖 클릭 시 닫기 (포커스는 이동한 곳에 그대로)
    document.addEventListener('click', function (e) {
      if (!popup.hidden && !root.contains(e.target)) close(false)
    })
  }

  Array.prototype.forEach.call(document.querySelectorAll('.date-input'), setup)
})()

// 예약 캘린더(sub8) — 퍼블리싱 단계: 이전/다음/오늘 월 이동만 동작한다.
// 날짜 선택, 예약 데이터 연동, 상세(rsv-detail) 갱신, 키보드 그리드 탐색은 개발 단계 구현 항목.
// 초기 달은 sub8.html의 정적 마크업(상태 칩 예시 포함)을 그대로 보존하고,
// 다른 달로 이동했다가 돌아오면 정적 마크업을 복원한다.
;(function () {
  'use strict'

  var root = document.querySelector('[data-rsv-cal]')
  if (!root) return

  var titleEl = root.querySelector('[data-rsv-title]')
  var gridEl = root.querySelector('[data-rsv-grid]')
  var prevBtn = root.querySelector('[data-rsv-prev]')
  var nextBtn = root.querySelector('[data-rsv-next]')
  var todayBtn = root.querySelector('[data-rsv-today]')

  var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
  var today = new Date()

  // 정적 마크업(초기 달) 보존 — 해당 달로 돌아오면 원본 그대로 복원
  var staticDay = gridEl.querySelector('.rsv-cal__day')
  var staticMonth = null
  var staticGrid = ''
  var staticTitle = titleEl.textContent
  if (staticDay) {
    var parts = staticDay.getAttribute('data-rsv-date').split('-')
    staticMonth = { y: +parts[0], m: +parts[1] - 1 }
    staticGrid = gridEl.innerHTML
  }

  var view = staticMonth || { y: today.getFullYear(), m: today.getMonth() }

  function isStaticMonth() {
    return !!staticMonth && view.y === staticMonth.y && view.m === staticMonth.m
  }

  function pad(n) { return (n < 10 ? '0' : '') + n }

  // 달력 그리드 렌더링 — 일요일 시작, 이웃 달 칸은 빈 셀
  function render() {
    if (isStaticMonth()) {
      titleEl.textContent = staticTitle
      gridEl.innerHTML = staticGrid
      return
    }

    titleEl.textContent = view.y + '년 ' + (view.m + 1) + '월'

    var lead = new Date(view.y, view.m, 1).getDay()
    var days = new Date(view.y, view.m + 1, 0).getDate()

    gridEl.textContent = ''
    var tr = null
    var cell = 0

    function nextCell() {
      if (cell % 7 === 0) {
        tr = document.createElement('tr')
        tr.setAttribute('role', 'row')
        gridEl.appendChild(tr)
      }
      cell += 1
    }

    function emptyCell() {
      nextCell()
      var td = document.createElement('td')
      td.setAttribute('role', 'gridcell')
      tr.appendChild(td)
    }

    var i
    for (i = 0; i < lead; i += 1) emptyCell()

    for (var day = 1; day <= days; day += 1) {
      nextCell()

      var date = new Date(view.y, view.m, day)
      var isToday = date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() && date.getDate() === today.getDate()

      var td = document.createElement('td')
      td.setAttribute('role', 'gridcell')

      var btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'rsv-cal__day'
      btn.setAttribute('data-rsv-date', view.y + '-' + pad(view.m + 1) + '-' + pad(day))
      btn.setAttribute('aria-label', view.y + '년 ' + (view.m + 1) + '월 ' + day + '일 ' +
        WEEKDAYS[date.getDay()] + '요일' + (isToday ? ' (오늘)' : ''))
      if (isToday) btn.setAttribute('aria-current', 'date')

      var num = document.createElement('span')
      num.className = 'rsv-cal__num'
      num.textContent = day
      btn.appendChild(num)

      td.appendChild(btn)
      tr.appendChild(td)
    }

    while (cell % 7 !== 0) emptyCell()
  }

  prevBtn.addEventListener('click', function () {
    view = view.m === 0 ? { y: view.y - 1, m: 11 } : { y: view.y, m: view.m - 1 }
    render()
  })

  nextBtn.addEventListener('click', function () {
    view = view.m === 11 ? { y: view.y + 1, m: 0 } : { y: view.y, m: view.m + 1 }
    render()
  })

  todayBtn.addEventListener('click', function () {
    view = { y: today.getFullYear(), m: today.getMonth() }
    render()
  })
})()
