# 타로정 (Tarot-Jeong) - 프론트엔드

본 프로젝트는 '타로정' 웹 애플리케이션의 프론트엔드입니다. [React](https://react.dev/)와 [Vite](https://vitejs.dev/)를 기반으로 구축된 모던한 Single Page Application (SPA) 입니다.

## ✨ 주요 기능

- **사용자 인증**: Supabase를 연동하여 Google 계정으로 간편하게 로그인할 수 있습니다.
- **타로점 보기**: 사용자의 고민을 입력하고, 동적으로 생성되는 타로 카드 중 3장을 선택하여 운세를 볼 수 있습니다.
- **결과 확인**: Google Gemini API가 생성한 상세한 타로점 해석 결과를 동적인 UI로 제공합니다.
- **결과 공유**: 타로점 결과를 다른 사람과 공유할 수 있는 고유 링크를 생성합니다.
- **에러 페이지**: 존재하지 않는 페이지(404)나 접근 권한이 없는 경우(403)를 위한 에러 페이지가 구현되어 있습니다.
- **반응형 UI**: 사이드바, 모달 등 사용성을 고려한 반응형 인터페이스를 제공합니다.

## 🛠️ 기술 스택 및 주요 라이브러리

- **Build Tool**: Vite
- **Framework**: React 19
- **Language**: JavaScript (ES6+)
- **Authentication**: `@supabase/supabase-js`
- **Styling**: CSS3 (Component-specific stylesheets)
- **Linting**: ESLint

## 📂 프로젝트 구조

```
Frontend/
├── public/              # favicon, share.html 등 정적 에셋
├── src/
│   ├── assets/          # 이미지, 로고 등 소스코드와 함께 번들될 에셋
│   ├── components/      # 재사용 가능한 React 컴포넌트 (Result, CardSelector 등)
│   ├── App.jsx          # 메인 애플리케이션 컴포넌트 (상태 및 라우팅 로직 포함)
│   ├── main.jsx         # 애플리케이션 진입점
│   └── index.css        # 전역 CSS 스타일
├── .github/workflows/   # GitHub Actions를 사용한 CI/CD 워크플로우
│   └── deploy.yaml      # main 브랜치 push 시 S3 및 CloudFront로 자동 배포
├── package.json         # 프로젝트 의존성 및 스크립트 정의
└── vite.config.js       # Vite 설정 파일
```
- **`public/share.html`**: 타로 결과를 공유하기 위한 독립적인 정적 페이지입니다. React 앱과 별개로 작동하여, 공유 링크를 받은 사람이 앱을 로드하지 않고도 빠르게 결과를 확인할 수 있도록 합니다.

## 🚀 로컬 환경에서 실행하기

### 사전 요구사항

- [Node.js](https://nodejs.org/) (LTS 버전 권장)
- [npm](https://www.npmjs.com/) (Node.js 설치 시 함께 설치됨)

### 설정 및 실행

1.  **프론트엔드 디렉터리로 이동**
    ```bash
    cd Frontend
    ```

2.  **의존성 설치**
    ```bash
    npm install
    ```

3.  **API 서버 주소 설정**

    개발을 위해 `src/App.jsx` 파일 상단에 있는 `API_URL` 상수를 실행 중인 백엔드 서버의 주소로 변경해야 합니다. (예: `http://127.0.0.1:3000`)
    ```javascript
    // src/App.jsx
    const API_URL = 'https://api.haechan.net'; // 이 부분을 로컬 백엔드 주소로 변경
    ```

4.  **개발 서버 실행**
    ```bash
    npm run dev
    ```
    서버가 실행되면 터미널에 나오는 주소(기본값: `http://localhost:5173`)로 접속하여 확인할 수 있습니다.

## 📜 주요 스크립트

- `npm run dev`: Vite 개발 서버를 실행합니다.
- `npm run build`: 프로덕션용으로 최적화된 정적 파일을 `dist/` 폴더에 생성합니다.
- `npm run lint`: ESLint를 사용하여 코드 스타일과 잠재적 오류를 검사합니다.
- `npm run preview`: 프로덕션 빌드 결과물을 로컬에서 미리 확인합니다.

## ☁️ 배포 (GitHub Actions)

이 프로젝트는 GitHub Actions를 통해 `main` 브랜치에 코드가 푸시(push)될 때마다 자동으로 AWS에 배포되도록 설정되어 있습니다.

### 배포 과정

1.  `main` 브랜치에 변경사항이 push됩니다.
2.  GitHub Actions 워크플로우(`.github/workflows/deploy.yaml`)가 실행됩니다.
3.  `npm install` 및 `npm run build`를 통해 React 애플리케이션을 빌드합니다.
4.  빌드 결과물(`dist/` 폴더)을 AWS S3 버킷에 업로드합니다.
5.  AWS CloudFront 캐시를 무효화하여 사용자가 즉시 최신 버전을 볼 수 있도록 합니다.

### 배포를 위한 GitHub Secrets 설정

자동 배포가 정상적으로 작동하려면, GitHub 저장소의 `Settings > Secrets and variables > Actions` 메뉴에서 다음 값들을 필수로 설정해야 합니다.

- `AWS_ACCESS_KEY_ID`: 배포 권한이 있는 IAM 사용자의 액세스 키
- `AWS_SECRET_ACCESS_KEY`: 위 IAM 사용자의 시크릿 액세스 키
- `AWS_S3_FRONTEND_BUCKET`: 프론트엔드 정적 파일이 저장될 S3 버킷의 이름
- `AWS_S3_FRONTEND_CLOUDFRONT_ID`: 위 S3 버킷과 연결된 CloudFront 배포의 ID