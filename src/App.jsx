import { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    photo: null,
    height: '',
    weight: '',
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData({ ...formData, photo: file });
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert('이미지 파일만 업로드 가능합니다.');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReport(null);

    const data = new FormData();
    data.append('photo', formData.photo);
    data.append('height', formData.height);
    data.append('weight', formData.weight);

    try {
      const response = await fetch('/api/consult', {
        method: 'POST',
        body: data,
      });

      // 응답 상태 확인
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = '분석 중 오류가 발생했습니다.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = `서버 에러 (${response.status}): API 서버가 준비되지 않았을 수 있습니다.`;
        }
        throw new Error(errorMessage);
      }

      // Content-Type 확인
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("서버로부터 올바른 응답(JSON)을 받지 못했습니다. 로컬 환경에서는 API 기능이 제한될 수 있습니다.");
      }

      const result = await response.json();
      setReport(result.report);
    } catch (error) {
      console.error('Error details:', error);
      alert(`알림: ${error.message}\n\n참고: 현재 로컬 개발 환경(Codespaces)에서는 API 기능 실행이 제한될 수 있습니다. 이 경우 실제 배포된 URL에서 확인해 주세요.`);
    } finally {
      setLoading(false);
    }
  };

  const handleMockSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const mockReport = `## 🌟 퍼스널 스타일 컨설팅 보고서

### 1. 체형 분석 및 특징
고객님의 키(${formData.height}cm)와 몸무게(${formData.weight}kg)를 바탕으로 분석한 결과, 균형 잡힌 실루엣을 가지고 계십니다. 업로드하신 사진을 통해 볼 때, 어깨 선이 곧고 다리가 길어 보이는 비율을 가지고 있어 다양한 스타일을 소화하기에 매우 유리한 체형입니다.

### 2. 가장 잘 어울리는 스타일 추천
- **미니멀 시크(Minimal Chic)**: 깔끔한 셔츠와 슬랙스 조합은 고객님의 체형을 가장 돋보이게 합니다.
- **세미 오버핏(Semi-Overfit)**: 너무 크지 않은 적당한 오버핏 상의는 어깨를 더 넓어 보이게 하며 트렌디한 느낌을 줍니다.

### 3. 피해야 할 아이템 및 스타일
- **과도한 와이드 팬츠**: 다리 라인을 가려 오히려 키를 작아 보이게 할 수 있습니다.
- **복잡한 패턴의 상의**: 시선이 분산되어 전체적인 실루엣의 장점을 가릴 수 있으니 무채색이나 단색 위주를 추천합니다.

### 4. 추천 아이템
- **상의**: 옥스포드 화이트 셔츠, 네이비 니트 베스트
- **하의**: 테이퍼드 핏 중청 데님, 차콜색 슬랙스
- **신발**: 화이트 가죽 스니커즈, 로퍼

**스타일리스트 한마디**: "고객님은 기본에 충실한 아이템만으로도 충분히 멋진 스타일을 완성할 수 있는 체형입니다. 자신감을 갖고 시도해 보세요!"`;
      setReport(mockReport);
      setLoading(false);
    }, 1500);
  };

  const renderReport = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="report-h2">{line.replace('## ', '')}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="report-h3">{line.replace('### ', '')}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="report-li">{line.replace('- ', '')}</li>;
      } else if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="report-p">
            {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
          </p>
        );
      }
      return line.trim() === '' ? <br key={index} /> : <p key={index} className="report-p">{line}</p>;
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        {!report ? (
          <div className="container">
            <h1 className="title">Personal Stylist Studio</h1>
            <p className="subtitle">Gemini AI가 당신만의 스타일을 찾아드립니다.</p>

            <form className="style-form" onSubmit={handleSubmit}>
              <div className="input-group photo-upload">
                <label htmlFor="photo">전신 사진 업로드</label>
                <div 
                  className={`photo-preview-container ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('photo').click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="photo-preview" />
                  ) : (
                    <div className="photo-placeholder">
                      <span className="upload-icon">📸</span>
                      <span>사진을 드래그하거나 클릭하여 선택하세요</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  required
                  style={{ display: 'none' }}
                />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="height">키 (cm)</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    placeholder="예: 175"
                    value={formData.height}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="weight">몸무게 (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    placeholder="예: 70"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="button-group">
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Gemini 분석 중...' : '실제 AI 분석 시작'}
                </button>
                <button type="button" className="mock-button" onClick={handleMockSubmit} disabled={loading}>
                  결과 화면 미리보기 (Mock)
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="container report-container">
            <div className="report-header">
              <span className="report-badge">Analysis Result</span>
              <h2 className="report-title">나의 스타일 컨설팅 보고서</h2>
            </div>
            <div className="report-body">
              {renderReport(report)}
            </div>
            <div className="report-footer">
              <button className="reset-button" onClick={() => setReport(null)}>
                다시 분석하기
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
