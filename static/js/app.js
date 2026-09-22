// DOM(웹 페이지 요소)이 완전히 로드된 후 실행됩니다.
document.addEventListener("DOMContentLoaded", () => {
    // 1. 입력 폼 및 필드 요소들
    const resumeForm = document.getElementById("resumeForm");
    const nameInput = document.getElementById("name");
    const jobTitleInput = document.getElementById("jobTitle");
    const toneSelect = document.getElementById("tone");
    const experienceTextarea = document.getElementById("experience");
    const projectsTextarea = document.getElementById("projects");
    const submitBtn = document.getElementById("submitBtn");

    // 2. 화면 표시 및 상태 관련 요소들
    const errorMessage = document.getElementById("errorMessage");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const placeholderText = document.getElementById("placeholderText");
    const resultContainer = document.getElementById("resultContainer");
    const resultOutput = document.getElementById("resultOutput");

    // 3. 상단 복사 및 다운로드 액션 버튼들
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    // AI가 생성한 마크다운 원본 텍스트를 보관하는 변수
    let currentGeneratedMarkdown = "";

    // 에러 메시지 출력 함수
    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = "block";
    }

    // 에러 메시지 숨김 함수
    function hideError() {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
    }

    // [이벤트] 폼 제출(생성하기 버튼 클릭) 시 동작
    resumeForm.addEventListener("submit", async (e) => {
        // 기본 폼 제출 동작(새로고침) 방지
        e.preventDefault();
        hideError();

        // 1단계: 프론트엔드 입력값 유효성 검사 (Validation)
        const name = nameInput.value.trim();
        const jobTitle = jobTitleInput.value.trim();
        const tone = toneSelect.value;
        const experience = experienceTextarea.value.trim();
        const projects = projectsTextarea.value.trim();

        // 선택된 라디오 버튼(Prompt A vs B) 값 확인
        const selectedPromptRadio = document.querySelector('input[name="promptType"]:checked');
        const promptType = selectedPromptRadio ? selectedPromptRadio.value : "A";

        if (!name) {
            showError("이름을 입력해 주세요.");
            nameInput.focus();
            return;
        }
        if (!jobTitle) {
            showError("지원 직무를 입력해 주세요.");
            jobTitleInput.focus();
            return;
        }
        if (!experience) {
            showError("주요 경력 사항을 입력해 주세요.");
            experienceTextarea.focus();
            return;
        }
        if (!projects) {
            showError("수행 프로젝트 경험을 입력해 주세요.");
            projectsTextarea.focus();
            return;
        }

        // 2단계: UI를 '로딩 중' 상태로 전환
        submitBtn.disabled = true;
        submitBtn.textContent = "⏳ Gemini AI가 열심히 작성 중입니다...";
        placeholderText.style.display = "none";
        resultContainer.style.display = "none";
        loadingIndicator.style.display = "block";
        copyBtn.disabled = true;
        downloadBtn.disabled = true;

        try {
            // 3단계: Flask 백엔드 서버의 /generate 라우트로 POST 요청 전송
            const response = await fetch("/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    job_title: jobTitle,
                    tone: tone,
                    prompt_type: promptType,
                    experience: experience,
                    projects: projects
                })
            });

            const data = await response.json();

            // 백엔드에서 반환된 성공 여부 확인
            if (!response.ok || !data.success) {
                throw new Error(data.error || "이력서 생성 중 서버 오류가 발생했습니다.");
            }

            // 4단계: 생성된 결과 화면에 출력
            currentGeneratedMarkdown = data.result;
            resultOutput.textContent = currentGeneratedMarkdown;

            loadingIndicator.style.display = "none";
            resultContainer.style.display = "block";
            copyBtn.disabled = false;
            downloadBtn.disabled = false;

        } catch (err) {
            // 5단계: 오류 발생 시 사용자에게 친절한 에러 메시지 표시
            loadingIndicator.style.display = "none";
            placeholderText.style.display = "block";
            showError(`⚠️ 오류: ${err.message}`);
        } finally {
            // 버튼 상태 원상복구
            submitBtn.disabled = false;
            submitBtn.textContent = "✨ AI 이력서 & 포트폴리오 생성하기";
        }
    });

    // [이벤트] 결과 클립보드 전체 복사 버튼 클릭
    copyBtn.addEventListener("click", async () => {
        if (!currentGeneratedMarkdown) return;

        try {
            await navigator.clipboard.writeText(currentGeneratedMarkdown);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "✅ 복사 완료!";
            copyBtn.style.backgroundColor = "#c6f6d5";
            copyBtn.style.color = "#22543d";

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = "";
                copyBtn.style.color = "";
            }, 2000);
        } catch (err) {
            alert("클립보드 복사에 실패했습니다. 결과 텍스트를 직접 드래그하여 복사해 주세요.");
        }
    });

    // [이벤트] 결과 마크다운(.md) 파일 다운로드 버튼 클릭
    downloadBtn.addEventListener("click", () => {
        if (!currentGeneratedMarkdown) return;

        const name = nameInput.value.trim() || "지원자";
        const job = jobTitleInput.value.trim() || "포트폴리오";
        // 특수문자를 치환한 안전한 파일 이름 생성 (예: 홍길동_백엔드_이력서_포트폴리오.md)
        const fileName = `${name}_${job}_이력서_포트폴리오.md`.replace(/[\/\\:*?"<>|]/g, "_");

        // Blob을 이용한 가상 링크 클릭 다운로드 구현
        const blob = new Blob([currentGeneratedMarkdown], { type: "text/markdown;charset=utf-8;" });
        const downloadUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement("a");

        tempLink.href = downloadUrl;
        tempLink.download = fileName;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        URL.revokeObjectURL(downloadUrl);
    });

    // ==========================================
    // 4. PWA (모바일/데스크톱) 앱 설치 버튼 로직
    // ==========================================
    const pwaInstallBtn = document.getElementById("pwaInstallBtn");
    let deferredPrompt = null;

    // 이미 홈 화면에 앱으로 설치되어 실행 중인지 확인
    const isStandalone = () => {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    };

    // iOS (Safari) 여부 감지
    const isIos = () => {
        const ua = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(ua);
    };

    // 이미 앱으로 실행 중이면 설치 버튼 숨김
    if (pwaInstallBtn) {
        if (isStandalone()) {
            pwaInstallBtn.style.display = "none";
        } else if (isIos()) {
            // iOS 사파리는 beforeinstallprompt 이벤트를 지원하지 않으므로 버튼을 항상 노출
            pwaInstallBtn.style.display = "inline-flex";
        }
    }

    // 안드로이드 / 크롬 / 엣지 등 PWA 설치 지원 브라우저
    window.addEventListener("beforeinstallprompt", (e) => {
        // 브라우저 기본 설치 배너 방지
        e.preventDefault();
        deferredPrompt = e;

        // 이미 설치된 상태가 아니라면 우리 커스텀 버튼 노출
        if (pwaInstallBtn && !isStandalone()) {
            pwaInstallBtn.style.display = "inline-flex";
        }
    });

    // 설치 버튼 클릭 시 동작
    if (pwaInstallBtn) {
        pwaInstallBtn.addEventListener("click", async () => {
            if (deferredPrompt) {
                // 안드로이드/크롬/엣지: 브라우저 네이티브 설치 팝업 띄우기
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === "accepted") {
                    console.log("[PWA] 사용자가 앱 설치를 수락했습니다.");
                } else {
                    console.log("[PWA] 사용자가 앱 설치를 취소했습니다.");
                }
                deferredPrompt = null;
                pwaInstallBtn.style.display = "none";
            } else if (isIos()) {
                // iOS 사용자를 위한 친절한 설치 안내
                alert("📲 아이폰/아이패드 홈 화면 설치 방법:\n\n1. Safari 브라우저 하단(또는 상단)의 [공유] 버튼(사각형에 위쪽 화살표 ↑)을 누릅니다.\n2. 메뉴를 아래로 스크롤하여 [홈 화면에 추가]를 선택해 주세요!");
            } else {
                alert("브라우저 메뉴(점 세 개 또는 설정)에서 '앱 설치' 또는 '홈 화면에 추가'를 선택하실 수도 있습니다.");
            }
        });
    }

    // 앱 설치 완료 감지 이벤트
    window.addEventListener("appinstalled", () => {
        console.log("[PWA] 앱 설치가 완료되었습니다.");
        if (pwaInstallBtn) {
            pwaInstallBtn.style.display = "none";
        }
        deferredPrompt = null;
    });
});
