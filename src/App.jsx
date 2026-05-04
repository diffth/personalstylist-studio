import { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    photo: null,
    height: '',
    weight: '',
  });
  const [previewUrl, setPreviewUrl] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Data:', formData);
    alert('정보가 입력되었습니다! 이제 당신의 스타일을 분석할 수 있습니다.');
  };

  return (
    <div className="App">
      <header className="App-header">
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

            <button type="submit" className="submit-button">
              스타일 분석 시작하기
            </button>
          </form>
        </div>
      </header>
    </div>
  );
}

export default App;
