const token = '3f8c9b7d1a6e4f2c8d9e5b7a1c3d6f8a9b2e4c7d1f5a8b3c6d9e2f4a7c1b8d5f';
const ids = [
  '69ea542847825c3bcd5b7862',
  '69ea542847825c3bcd5b7861',
  '69ea542847825c3bcd5b7863',
  '69ea542847825c3bcd5b786c',
  '69ea542847825c3bcd5b7865'
];

(async () => {
  for (const id of ids) {
    const r = await fetch(`https://lamsa-iphone-backend.vercel.app/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-internal-token': token },
      body: JSON.stringify({ salePrice: null })
    });
    const d = await r.json();
    console.log(r.status, d.name ?? JSON.stringify(d));
  }
})();
