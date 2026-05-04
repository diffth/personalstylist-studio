export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const height = formData.get('height');
    const weight = formData.get('weight');
    const photo = formData.get('photo');

    // Google API Key 확인 (환경 변수 사용)
    const apiKey = env.GOOGLE_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Google API key not configured in Cloudflare environment" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 사진 데이터를 Base64로 변환
    const arrayBuffer = await photo.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    // Google Gemini API 호출 (Generative Language API)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `당신은 전문 퍼스널 스타일리스트입니다. 다음 사용자의 정보를 바탕으로 상세한 스타일 컨설팅 보고서를 작성해주세요.
                사용자 정보:
                - 키: ${height}cm
                - 몸무게: ${weight}kg
                
                보고서 포함 내용:
                1. 체형 분석 및 특징
                2. 가장 잘 어울리는 스타일 추천
                3. 피해야 할 아이템 및 스타일
                4. 추천 아이템 (상의, 하의, 신발 등)
                
                한국어로 친절하고 전문적으로 답변해주세요.`
              },
              {
                inline_data: {
                  mime_type: photo.type || "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        }
      }),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Gemini 응답 구조에서 텍스트 추출
    const reportText = result.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ report: reportText }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
