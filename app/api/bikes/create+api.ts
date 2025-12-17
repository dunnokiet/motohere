export async function GET(req: Request) {
  const formData = new FormData();

  const car = {
    ownerId: 10,
    brand: 'Yamaha',
    model: 'Exciter 155 VVA',
    licensePlate: '59A8-45219',
    year: 2023,
    pricePerHour: 150000,
    location: {
      name: '180 Lý Tự Trọng, Phường Bến Thành',
      province: 'Thành phố Hồ Chí Minh',
      ward: 'Quận 1',
      latitude: 10.773410056699738,
      longitude: 106.69567826734344,
    },
  };

  const accessToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0NVU1RPTUVSIiwicmVhZCIsInVwZGF0ZSIsImNyZWF0ZSIsIlJPTEVfT1dORVIiLCJjcmVhdGUiLCJyZWFkIiwiZGVsZXRlIiwidXBkYXRlIl0sInN1YiI6ImJhb2xvbmciLCJpYXQiOjE3NjU5NDczNDYsImV4cCI6MTc2NTk1NDU0Nn0.SCyoI-0B_M2HJ5e2EDxSCX0hLwkVkUty_CX-9XTkMYE';

  formData.append('images', createValidDummyImage());

  formData.append('car', new Blob([JSON.stringify(car)], { type: 'application/json' }));

  const response = await fetch('http://localhost:8080/api/v1/managemention-cars/create', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'POST',
    body: formData,
  });

  return Response.json({ hello: 'world' });
}

function createValidDummyImage(name = 'dummy.png'): File {
  const base64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

  const byteString = atob(base64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }

  return new File([bytes], name, { type: 'image/png' });
}
