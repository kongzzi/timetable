// 강의 데이터 저장할 배열
let lectures = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initTimetable();
    loadLecturesFromStorage();
    renderTimetable();
    renderLectureList();

    // 폼 제출 이벤트
    document.getElementById('lectureForm').addEventListener('submit', addLecture);
});

// 시간표 초기화 (1교시 9시 ~ 8교시 17시, 30분 단위)
function initTimetable() {
    const days = ['월', '화', '수', '목', '금'];
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

    // 1교시는 9시부터, 30분 단위로 표시
    for (let hour = 9; hour < 17; hour++) {
        // 시간
        const row1 = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.className = 'time-header';
        timeCell.textContent = `${hour}:00`;
        row1.appendChild(timeCell);

        days.forEach(() => {
            const cell = document.createElement('td');
            cell.id = `cell-${hour}-00`;
            row1.appendChild(cell);
        });

        tbody.appendChild(row1);

        // 30분
        const row2 = document.createElement('tr');
        const timeCell2 = document.createElement('td');
        timeCell2.className = 'time-header';
        timeCell2.textContent = `${hour}:30`;
        row2.appendChild(timeCell2);

        days.forEach(() => {
            const cell = document.createElement('td');
            cell.id = `cell-${hour}-30`;
            row2.appendChild(cell);
        });

        tbody.appendChild(row2);
    }
}

// 강의 추가
function addLecture(e) {
    e.preventDefault();

    const lectureName = document.getElementById('lectureName').value;
    const classroom = document.getElementById('classroom').value;
    const day = document.getElementById('day').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    // 강의 객체 생성
    const lecture = {
        id: Date.now(),
        name: lectureName,
        classroom: classroom,
        day: day,
        startTime: startTime,
        endTime: endTime
    };

    // 배열에 추가
    lectures.push(lecture);

    // 로컬 스토리지에 저장
    saveLecturesToStorage();

    // 폼 초기화
    document.getElementById('lectureForm').reset();

    // UI 업데이트
    renderTimetable();
    renderLectureList();
}

// 시간표 렌더링
function renderTimetable() {
    // 기존 강의 셀 초기화
    const allCells = document.querySelectorAll('[id^="cell-"]');
    allCells.forEach(cell => {
        cell.innerHTML = '';
        cell.style.backgroundColor = '';
    });

    const days = ['월', '화', '수', '목', '금'];

    // 각 강의를 시간표에 배치
    lectures.forEach(lecture => {
        const dayIndex = days.indexOf(lecture.day) + 1; // 요일의 열 인덱스
        const [startHour, startMin] = lecture.startTime.split(':').map(Number);
        const [endHour, endMin] = lecture.endTime.split(':').map(Number);

        // 시작 시간부터 종료 시간까지 셀 선택
        let currentHour = startHour;
        let currentMin = startMin;

        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
            const cellId = `cell-${currentHour}-${String(currentMin).padStart(2, '0')}`;
            const cell = document.getElementById(cellId);

            if (cell) {
                if (cell.innerHTML === '') {
                    // 첫 번째 셀에만 강의 정보 표시
                    const lectureCell = document.createElement('div');
                    lectureCell.className = 'lecture-cell';
                    lectureCell.innerHTML = `<strong>${lecture.name}</strong><br>${lecture.classroom}`;
                    lectureCell.onclick = () => deleteLecture(lecture.id);
                    cell.appendChild(lectureCell);
                } else {
                    // 이후 셀은 배경색만 변경
                    cell.style.backgroundColor = '#f0a8f0';
                }
            }

            // 30분씩 증가
            currentMin += 30;
            if (currentMin === 60) {
                currentMin = 0;
                currentHour += 1;
            }
        }
    });
}

// 강의 목록 렌더링
function renderLectureList() {
    const lectureList = document.getElementById('lectureList');

    if (lectures.length === 0) {
        lectureList.innerHTML = '<p class="empty-message">아직 추가된 강의가 없어요! 위의 폼에서 강의를 추가해보세요.</p>';
        return;
    }

    lectureList.innerHTML = '';

    lectures.forEach(lecture => {
        const card = document.createElement('div');
        card.className = 'lecture-card';
        card.innerHTML = `
            <div class="lecture-card-title">📖 ${lecture.name}</div>
            <div class="lecture-card-info"><strong>강의실:</strong> ${lecture.classroom}</div>
            <div class="lecture-card-info"><strong>요일:</strong> ${lecture.day}요일</div>
            <div class="lecture-card-info"><strong>시간:</strong> ${lecture.startTime} ~ ${lecture.endTime}</div>
            <button class="btn-delete" onclick="deleteLecture(${lecture.id})">🗑️ 삭제</button>
        `;
        lectureList.appendChild(card);
    });
}

// 강의 삭제
function deleteLecture(id) {
    lectures = lectures.filter(lecture => lecture.id !== id);
    saveLecturesToStorage();
    renderTimetable();
    renderLectureList();
}

// 로컬 스토리지에 저장
function saveLecturesToStorage() {
    localStorage.setItem('lectures', JSON.stringify(lectures));
}

// 로컬 스토리지에서 불러오기
function loadLecturesFromStorage() {
    const stored = localStorage.getItem('lectures');
    if (stored) {
        lectures = JSON.parse(stored);
    }
}
