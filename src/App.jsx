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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
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

      if (!response.ok) {
        throw new Error('분석 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      setReport(result.choices[0].message.content);
    } catch (error) {
      console.error(error);
      alert('스타일 분석을 가져오는 데 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {!report ? (
          <div className="container">
            <h1 className="title">Personal Stylist Studio</h1>
            <p className="subtitle">당신만의 완벽한 스타일을 찾아드립니다.</p>

            <form className="style-form" onSubmit={handleSubmit}>
              <div className="input-group photo-upload">
                <label htmlFor="photo">전신 사진 업로드</label>
                <div className="photo-preview-container">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="photo-preview" />
                  ) : (
                    <div className="photo-placeholder">
                      <span>사진을 선택해주세요</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  required
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

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? '스타일 분석 중...' : '스타일 분석 시작하기'}
              </button>
            </form>
          </div>
        ) : (
          <div className="container report-container">
            <h2 className="report-title">나의 스타일 컨설팅 보고서</h2>
            <div className="report-content">
              {report.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <button className="reset-button" onClick={() => setReport(null)}>
              다시 분석하기
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
