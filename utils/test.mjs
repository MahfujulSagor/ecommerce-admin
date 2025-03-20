// Create a few example files
const file1 = new File(["file content 1"], "image1.jpg", { type: "image/jpeg" });
const file2 = new File(["file content 2"], "image2.png", { type: "image/png" });
const file3 = new File(["file content 3"], "image3.webp", { type: "image/webp" });

// Create a simulated FileList
const fileList = {
  0: file1,
  1: file2,
  2: file3,
  length: 3,
};

// Now you can treat this as if it were a FileList from the input element

const files = Array.from(fileList).map((file)=> file);

const newFiles = [...files]

console.log(newFiles);

