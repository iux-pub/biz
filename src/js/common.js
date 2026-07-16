// 모바일 드로어 내비게이션 — 접근성: aria-expanded + Esc 닫기 + 스크림
(function () {
  var toggle = document.querySelector('[data-drawer-toggle]');
  var drawer = document.getElementById('biz-nav');
  var scrim = document.querySelector('[data-drawer-scrim]');
  if (!toggle || !drawer || !scrim) return;

  function open() {
    drawer.classList.add('biz-sidebar--expanded');
    scrim.hidden = false;
    // 트랜지션 시작을 위해 다음 프레임에 표시 클래스 부여
    requestAnimationFrame(function () {
      scrim.classList.add('biz-scrim--expanded');
    });
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '메뉴 닫기');
  }
  function close() {
    drawer.classList.remove('biz-sidebar--expanded');
    scrim.classList.remove('biz-scrim--expanded');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
    window.setTimeout(function () {
      scrim.hidden = true;
    }, 200);
  }

  toggle.addEventListener('click', function () {
    if (toggle.getAttribute('aria-expanded') === 'true') close();
    else open();
  });
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });
})();

// 사진 업로드 — X 클릭 시 삭제, 사진추가 클릭 시 파일 선택 후 기존 사진 옆에 추가
(function () {
  var grid = document.querySelector('[data-photo-grid]');
  var addSlot = document.querySelector('[data-photo-add-slot]');
  var addBtn = document.querySelector('[data-photo-add]');
  var input = document.querySelector('[data-photo-input]');
  if (!grid || !addSlot || !addBtn || !input) return;

  // 사진추가 버튼 → 숨김 파일 입력 열기
  addBtn.addEventListener('click', function () {
    input.click();
  });

  // 선택한 이미지 파일을 사진추가 카드 앞에 삽입
  input.addEventListener('change', function () {
    Array.prototype.slice.call(input.files || []).forEach(function (file) {
      if (file.type.indexOf('image/') !== 0) return;

      var li = document.createElement('li');
      li.className = 'photo-item';

      var img = document.createElement('img');
      img.className = 'photo-item__img';
      img.src = URL.createObjectURL(file);
      img.alt = '업로드한 사진 — ' + file.name;

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'photo-item__remove';
      removeBtn.setAttribute('aria-label', file.name + ' 사진 삭제');
      removeBtn.innerHTML = `
      <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.13334 17.5449L5.45508 16.8667L10.8217 11.5L5.45508 6.13334L6.13334 5.45508L11.5 10.8217L16.8667 5.45508L17.5449 6.13334L12.1783 11.5L17.5449 16.8667L16.8667 17.5449L11.5 12.1783L6.13334 17.5449Z" fill="#222222"/>
      </svg>
      `;

      li.appendChild(img);
      li.appendChild(removeBtn);
      grid.insertBefore(li, addSlot);
    });
    // 같은 파일 재선택이 가능하도록 초기화
    input.value = '';
  });

  // X 버튼 → 해당 사진 삭제 (이벤트 위임 — 동적 추가 사진 포함)
  grid.addEventListener('click', function (e) {
    var removeBtn = e.target.closest('.photo-item__remove');
    if (!removeBtn) return;

    var item = removeBtn.closest('.photo-item');
    var img = item.querySelector('.photo-item__img');

    // 동적 생성 blob URL 메모리 해제
    if (img && img.src.indexOf('blob:') === 0) URL.revokeObjectURL(img.src);
    item.remove();

    // 삭제된 버튼에 있던 포커스 유실 방지
    addBtn.focus();
  });
})();
