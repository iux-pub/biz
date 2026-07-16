// 회원가입 모달 스텝 위저드 — 1/3 계정 정보 → 2/3 사업자 진위확인 → 3/3 사업장 정보
// 1·2단계 폼은 제출을 가로채 다음 단계를 표시하고(네이티브 필수값 검증은 그대로 동작),
// 3단계 폼만 실제 제출된다. 모달을 다시 열면 1단계부터 시작.
;(function () {
  var wrap = document.querySelector('[data-signup-steps]')
  if (!wrap) return

  var steps = wrap.querySelectorAll('[data-step]')

  function setStep(n, focus) {
    Array.prototype.forEach.call(steps, function (s) {
      s.hidden = s.getAttribute('data-step') !== String(n)
    })
    if (focus) {
      var visible = wrap.querySelector('[data-step="' + n + '"]')
      var first = visible && visible.querySelector('input:not([type="hidden"]):not(.sr-only), select, textarea')
      if (first) first.focus()
    }
  }

  Array.prototype.forEach.call(wrap.querySelectorAll('form[data-next-step]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      setStep(form.getAttribute('data-next-step'), true)
    })
  })

  // 모달 트리거를 다시 누르면 1단계로 초기화 (포커스는 modal.js가 처리)
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-modal-open="signup-modal"]')) setStep(1, false)
  })
})()
