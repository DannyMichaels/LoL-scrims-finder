import Compress from 'compress.js';

/**
 * @method renameFile
 * takes a file and changes its name
 * @param {File} file the file that is going to have it's name changes
 * @param {String} newName
 */
export const renameFile = async (file, newName) => {
  // does this have to be async?
  let fileExtension = file.name.substring(file.name.lastIndexOf('.')); // .jpg, .png, etc...
  let newFileName = `${newName}${fileExtension}`; // make a new name: scrim._id, current time, and extension

  // change name of file to something more traceable (I don't want users random names).
  return Object.defineProperty(file, 'name', {
    writable: true,
    value: newFileName, // file extension isn't necessary with this approach.
  });
};

export const resizeImage = async (file) => {
  const [resizedImage] = await Compress.compress([file], {
    size: 1, // the max size in MB, defaults to 2MB
    quality: 1, // the quality of the image, max is 1,
    maxWidth: 300, // the max width of the output image, defaults to 1920px
    maxHeight: 300, // the max height of the output image, defaults to 1920px
    resize: true, // defaults to true, set false if you do not want to resize the image width and height
  });

  const base64str = resizedImage.data;
  const imgExt = resizedImage.ext;
  const resizedFile = Compress.convertBase64ToFile(base64str, imgExt);
  return resizedFile;
};

/**
 * @method checkFileSize
 * takes a file and checks if it fits the size range
 * @param {Boolean} success
 */

// 1 megabyte (in Memibyte format)
export const checkFileSize = async ({
  file,
  setCurrentAlert,
  maxFileSizeMib = 0.953674,
  fileInputRef,
}) => {
  const fileSize = file.size / 1024 / 1024; // in MiB

  if (fileSize > maxFileSizeMib) {
    if (fileInputRef && fileInputRef.current !== undefined) {
      fileInputRef.current.value = '';
    }

    if (setCurrentAlert) {
      setCurrentAlert({
        type: 'Error',
        message: `File ${file.name} is too big! \nmax allowed size: 1 MB.`,
      });
    }

    return false;
  }

  return true;
};

export const checkIsImage = async ({ file, fileInputRef, setCurrentAlert }) => {
  if (!/^image\//.test(file.type)) {
    // if file type isn't an image, return
    fileInputRef.current.value = '';
    setCurrentAlert({
      type: 'Error',
      message: `File ${file.name} is not an image! \nonly images are allowed.`,
    });
    return false;
  }

  return true;
};
