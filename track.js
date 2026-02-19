export default async function handler(req, res) {
  // 处理跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customNumber } = req.body;
  if (!customNumber) {
    return res.status(400).json({ error: '请输入物流单号' });
  }

  // 你的真实17track API Key
  const API_KEY = '3FCB20328F52E3B2FE6D492DAAED20B3';

  try {
    // 1. 先在17track注册单号
    const registerRes = await fetch('https://api.17track.net/track/v2/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY
      },
      body: JSON.stringify({
        data: [{ number: customNumber }]
      })
    });

    const registerData = await registerRes.json();
    if (registerData.code !== 200) {
      return res.status(500).json({ error: '注册单号失败' });
    }

    // 2. 查询物流信息
    const trackRes = await fetch('https://api.17track.net/track/v2/gettrackinfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY
      },
      body: JSON.stringify({
        data: [{ number: customNumber }]
      })
    });

    const trackData = await trackRes.json();
    if (trackData.code !== 200 || !trackData.data || trackData.data.length === 0) {
      return res.status(404).json({ error: '未找到该单号信息' });
    }

    const trackInfo = trackData.data[0];
    const tracks = (trackInfo.trackInfo || []).map(item => ({
      time: item.time,
      desc: item.message
    }));

    return res.status(200).json({
      customNumber,
      status: trackInfo.status || '查询中',
      tracks
    });

  } catch (error) {
    console.error('17track API error:', error);
    return res.status(500).json({ error: '查询失败，请稍后重试' });
  }
}
