 const crypto = require("crypto");
const generateSHA1 = (data) => {
  const hash = crypto.createHash("sha1");
  hash.update(data);
  return hash.digest("hex");
};

exports.cloudinaryConfig = {
  uploadPreset:"ufguqm3p",
  cloudName:"dzdqy3wfg",
  apiKey:"991617455618985",
  apiSecret:"W604bRhre6o_Ngc2EDIiOpU9uvE",
}

const generateSignature = (publicId, apiSecret) => {
  const timestamp = new Date().getTime();
  return `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
};

exports.imageUpload = async (
  file,
  {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
  }
) => {
  const formData = new FormData();

  console.log({ CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET });

  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return { public_id: data.public_id, url: data.secure_url };
};

exports.handleDeleteImage = async (
  publicId,
  {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
  }
) => {
  const cloudName = CLOUDINARY_CLOUD_NAME;
  const timestamp = new Date().getTime();
  const apiKey = CLOUDINARY_API_KEY;
  const apiSecret = CLOUDINARY_API_SECRET;
  const signature = generateSHA1(generateSignature(publicId, apiSecret));
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

  try {
    // const response = await axios.post(url, {
    //     public_id: publicId,
    //     signature: signature,
    //     api_key: apiKey,
    //     timestamp: timestamp,
    // });

    // console.error(response);

    const formData = new FormData();

    formData.append("public_id", publicId);
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
};