const handleUpload = async (file) => {
  if (!file) return;

  const sigRes = await axiosPublic.get('/admin/cloudinary-signature'); // replace with your NestJS API URL
  //   console.log(sigRes.data, 'dataa');
  const { cloudName, upload_preset } = await sigRes.data;

  const imageData = new FormData();
  imageData.append('file', file);
  imageData.append('upload_preset', upload_preset);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: imageData },
  );

  const data = await uploadRes.json();
  console.log(data, 'uploaded data');

  return data.secure_url;
};