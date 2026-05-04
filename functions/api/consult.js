export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const height = formData.get('height');
    const weight = formData.get('weight');
    const photo = formData.get('photo'); // 파일 객체

    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 사진 데이터를 Base64로 변환 (멀티모달 비전 모델 사용 시 필요)
    // 여기서는 텍스트 기반 분석 예시를 먼저 작성하고, 실제 이미지를 OpenAI Vision API에 보내는 방식으로 구성합니다.
    const arrayBuffer = await photo.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // 혹은 "gpt-4-vision-preview"
        messages: [
          {
            role: "system",
            content: "당신은 전문 퍼스널 스타일리스트입니다. 사용자의 사진, 키, 몸무게 정보를 바탕으로 스타일 컨설팅 보고서를 작성해주세요. 보고서는 체형 분석, 추천 스타일, 피해야 할 스타일, 추천 아이템을 포함해야 합니다. 한국어로 친절하게 답변해주세요."
          },
          {
            role: "user",
            content: [
              { type: "text", text: `제 키는 ${height}cm이고 몸무게는 ${weight}kg입니다. 저에게 어울리는 스타일을 분석해주세요.` },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
