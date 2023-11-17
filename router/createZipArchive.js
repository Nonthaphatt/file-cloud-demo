const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

function createZipArchive(folderPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(`${folderPath}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } }); // Compression level

    // Pipe the output stream to the ZIP archive
    archive.pipe(output);

    fs.readdir(folderPath, async function (err, files) {
      if (err) {
        reject(err);
        return;
      }

      if (!files.length) {
        // If directory is empty, add an empty directory entry to the archive
        archive.directory(folderPath, false);
        archive.finalize();
      } else {
        // Add each file to the archive
        files.forEach((fileName) => {
          const filePath = path.join(folderPath, fileName);
          const fileContent = fs.createReadStream(filePath);
          archive.append(fileContent, { name: fileName });
        });

        // Finalize the ZIP archive
        archive.finalize();
      }

      output.on('close', () => resolve(`${folderPath}.zip`));
      archive.on('error', (err) => reject(err));
    });
  });
}

module.exports = createZipArchive;
