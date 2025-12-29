export async function PATCH(req: Request) {
  const incomingForm = (await req.formData()) as any;

  const carPart = incomingForm.get('car') as string | Blob | null;

  let carJson = '';
  if (typeof carPart === 'string') {
    carJson = carPart;
  } else if (carPart instanceof Blob) {
    carJson = await carPart.text();
  }

  const backendForm = new FormData() as any;

  if (carJson) {
    backendForm.append('car', new Blob([carJson], { type: 'application/json' }));
  }

  const images = incomingForm.getAll('images') as any[];
  images.forEach((img) => {
    backendForm.append('images', img as any);
  });

  const authHeader = req.headers.get('authorization') ?? '';

  const response = await fetch('http://localhost:8080/api/v1/managemention-cars/update', {
    method: 'PATCH',
    headers: {
      Authorization: authHeader,
    },
    body: backendForm,
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
