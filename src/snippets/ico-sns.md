# SNS 로고 아이콘 (ico-sns) — 감성미식 BIZ

인스타그램·네이버 블로그 단색 로고. CSS mask 방식 — HTML에 SVG를 넣지 않는다.
모양은 `mask-image`(svg 파일), 색은 `background-color: currentColor`로 **부모의 color를 그대로 상속**한다.

## 기본 마크업

```html
<!-- 인스타그램 로고 -->
<span class="ico-sns ico-sns--instagram" aria-hidden="true"></span>

<!-- 네이버 블로그 로고 -->
<span class="ico-sns ico-sns--naver-blog" aria-hidden="true"></span>
```

아이콘 코드 바로 윗줄에 채널명 주석(`<!-- 인스타그램 로고 -->` / `<!-- 네이버 블로그 로고 -->`)을
항상 함께 적는다 — 6개 페이지 전체가 이 컨벤션을 따른다.

크기·display는 `ico-sns`가 정하지 않는다 — **반드시 사용처 아이콘 클래스와 함께 쓴다.**
색은 CSS에서 아이콘(또는 부모)에 `color`만 지정하면 바뀐다.

## 페이지별 실제 사용 마크업

### main.html — SNS 연동 상태 (`.sns-item`)

```html
<span class="sns-item__icon" aria-hidden="true">
  <span class="ico-sns ico-sns--instagram" aria-hidden="true"></span>
</span>
<!-- 색: 기본 흐림(#e8ede3), .sns-item--connected일 때 세이지(#5a928b) — CSS가 처리 -->
```

### sub4.html — 플랫폼 탭 (`.platform-tabs`)

```html
<span class="platform-tabs__icon ico-sns ico-sns--instagram" aria-hidden="true"></span>
<!-- 색: 기본 #ccc, 선택된 탭에서 흰색 — CSS가 처리 -->
```

### sub5.html — 채널별 게시 설정 (`.channel-item`)

```html
<span class="channel-item__icon" aria-hidden="true">
  <span class="ico-sns ico-sns--instagram" aria-hidden="true"></span>
</span>
```

### sub6.html — 게시이력 채널 (`.history-card`)

```html
<span class="history-card__channel-icon" aria-hidden="true">
  <span class="ico-sns ico-sns--naver-blog" aria-hidden="true"></span>
</span>
<!-- 색: 채널 상태 modifier(history-card__channel--success/--error/--pending)가 처리 -->
```

### sub7.html — 계정연동 카드 (`.sns-account`, 86px 대형)

```html
<span class="sns-account__icon" aria-hidden="true">
  <span class="ico-sns ico-sns--naver-blog" aria-hidden="true"></span>
</span>
<!-- 색: 기본 #ccc(미연결), .sns-account--connected일 때 세이지 — CSS가 처리 -->
```

### sub8.html — 예약캘린더 상태 칩 (`.rsv-cal__mark`, PC에서만 아이콘 노출)

```html
<span class="rsv-cal__mark rsv-cal__mark--error">
  <span class="rsv-cal__mark-icon ico-sns ico-sns--naver-blog" aria-hidden="true"></span>
  <span class="rsv-cal__mark-label">11:30 실패</span>
</span>
<!-- 아이콘 색: 칩 안 흰색(text-inverse) — CSS가 처리 -->
```

### sub8.html — 예약 게시 상세 (`.rsv-event`)

```html
<article class="rsv-event rsv-event--pending">
  <span class="rsv-event__icon ico-sns ico-sns--instagram" aria-hidden="true"></span>
  <p class="rsv-event__head">7/1 (수) 18:00<br />인스타그램 게시 스마트예약</p>
  ...
</article>
<!-- 색: 상태 modifier(--pending #666 / --success #5a928b / --error #ff2600)가 처리 -->
```

## 규칙

- 색상은 항상 CSS `color`(토큰) → `currentColor` 상속으로 변경한다. 아이콘에 직접 배경색을 덮지 않는다.
- 로고를 인라인 `<svg>`로 다시 넣지 않는다 — 모양 수정은 `src/image/icon-*.svg` 파일에서 한다.
- 아이콘 추가: ① `src/image/icon-이름.svg` 저장 → ② `biz-icons.css`에 `.ico-sns--이름 { @apply [mask-image:url('../../src/image/icon-이름.svg')]; }` 한 줄 추가.
  (url은 빌드 산출물 `dist/css/style.css` 기준 상대경로 — 빌드가 재배치하지 않음)
- 원본 비율: instagram 40:40 · naver-blog 37:40. `mask: contain`이 박스 안에서 비율을 유지하므로 정사각 박스에 넣어도 안전하다.

## 접근성

- 로고는 장식이므로 `aria-hidden="true"` 필수 — 채널명은 항상 옆의 텍스트(예: `.sns-item__name`)가 전달한다.
- 텍스트 없이 아이콘만 단독으로 의미를 전달해야 하면 부모에 `aria-label="인스타그램"`을 붙인다.

## 출처

- CSS: `src/styles/7-utilities/project/biz-icons.css`
- 마스크 원본: `src/image/icon-instagram.svg`, `src/image/icon-naver-blog.svg`
