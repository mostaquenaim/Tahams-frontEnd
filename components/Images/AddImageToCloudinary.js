import useAxiosPublic from '/Hooks/useAxiosPublic';

export const handleUploadWithCloudinary = async (file) => {
  const axiosPublic = useAxiosPublic();
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Image must be under 2MB');
  }

  const sigRes = await axiosPublic.get('/admin/cloudinary-signature');
  // console.log(sigRes.data, 'dataa');

  // const { cloudName, upload_preset } = await sigRes.data;

  const { signature, timestamp, apiKey, cloudName, folder } = data;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  const uploadData = await uploadRes.json();

  const optimizedUrl = uploadData.secure_url.replace(
    '/upload/',
    '/upload/w_600,q_auto,f_auto/',
  );

  // Store THIS in DB (recommended)
  return optimizedUrl;
};
