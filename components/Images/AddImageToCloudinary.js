import useAxiosSecure from '/Hooks/useAxiosSecure';

export const handleUploadWithCloudinary = async (file) => {
  const axiosSecure = useAxiosSecure();
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Image must be under 2MB');
  }

  const sigRes = await axiosSecure.get('/admin/cloudinary-signature');

  const { signature, timestamp, apiKey, cloudName, folder } = sigRes.data;

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

  return optimizedUrl;
};
