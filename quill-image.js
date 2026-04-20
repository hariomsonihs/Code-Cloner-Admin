// Quill editor mein Firebase Storage image upload support add karo
export function addImageUploadToQuill(quill, app) {

  // Toolbar mein image button ka handler override karo
  quill.getModule("toolbar").addHandler("image", () => {
    const menu = document.createElement("div");
    menu.style.cssText = `
      position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,.45);backdrop-filter:blur(4px)
    `;
    menu.innerHTML = `
      <div style="background:#fff;border-radius:20px;padding:1.5rem;width:100%;max-width:420px;box-shadow:0 24px 60px rgba(0,0,0,.2)">
        <div style="font-weight:700;font-size:1rem;margin-bottom:1rem;color:#111">📷 Image Insert karo</div>

        <div style="margin-bottom:1rem">
          <label style="font-size:.8rem;font-weight:600;color:#666;display:block;margin-bottom:.4rem">🌐 Internet se URL paste karo</label>
          <input id="img-url-input" type="text" placeholder="https://example.com/image.jpg"
            style="width:100%;border:1.5px solid #dde3f0;border-radius:10px;padding:.6rem .75rem;font-size:.9rem;outline:none"/>
          <button id="img-url-btn" style="margin-top:.5rem;width:100%;background:linear-gradient(115deg,#4f6ef7,#7c3aed);color:#fff;border:none;border-radius:10px;padding:.6rem;font-weight:600;cursor:pointer;font-size:.9rem">
            Insert from URL
          </button>
        </div>

        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem">
          <div style="flex:1;height:1px;background:#eee"></div>
          <span style="font-size:.78rem;color:#aaa">ya</span>
          <div style="flex:1;height:1px;background:#eee"></div>
        </div>

        <div>
          <label style="font-size:.8rem;font-weight:600;color:#666;display:block;margin-bottom:.4rem">📁 Device se upload karo (Firebase Storage)</label>
          <label id="img-upload-label" style="display:flex;align-items:center;justify-content:center;gap:.5rem;border:2px dashed #c7d2fe;border-radius:10px;padding:1rem;cursor:pointer;color:#4f6ef7;font-weight:600;font-size:.9rem">
            📁 File choose karo
            <input id="img-file-input" type="file" accept="image/*" style="display:none"/>
          </label>
          <div id="img-upload-status" style="font-size:.8rem;color:#666;margin-top:.4rem;text-align:center"></div>
        </div>

        <button id="img-cancel-btn" style="margin-top:1rem;width:100%;background:#f3f4f6;border:none;border-radius:10px;padding:.6rem;font-weight:600;cursor:pointer;font-size:.9rem;color:#555">
          Cancel
        </button>
      </div>
    `;
    document.body.appendChild(menu);

    const close = () => menu.remove();

    menu.querySelector("#img-cancel-btn").addEventListener("click", close);
    menu.addEventListener("click", e => { if (e.target === menu) close(); });

    // URL se insert
    menu.querySelector("#img-url-btn").addEventListener("click", () => {
      const url = menu.querySelector("#img-url-input").value.trim();
      if (!url) return;
      insertImage(quill, url);
      close();
    });

    // Enter key se bhi insert ho
    menu.querySelector("#img-url-input").addEventListener("keydown", e => {
      if (e.key === "Enter") menu.querySelector("#img-url-btn").click();
    });

    // File upload
    menu.querySelector("#img-file-input").addEventListener("change", async function () {
      const file = this.files[0];
      if (!file) return;
      const status = menu.querySelector("#img-upload-status");
      const label = menu.querySelector("#img-upload-label");
      label.style.opacity = ".5";
      status.textContent = "Uploading...";
      try {
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js");
        const storage = getStorage(app);
        const storageRef = ref(storage, `post-images/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        insertImage(quill, url);
        close();
      } catch (e) {
        status.textContent = "Upload failed: " + e.message;
        label.style.opacity = "1";
      }
    });
  });
}

function insertImage(quill, url) {
  const range = quill.getSelection(true);
  quill.insertEmbed(range.index, "image", url);
  // Turant size set karo inserted image pe
  setTimeout(() => {
    const imgs = quill.root.querySelectorAll("img");
    imgs.forEach(img => {
      if (!img.style.maxWidth) {
        img.style.maxWidth = "480px";
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.borderRadius = "10px";
        img.style.display = "block";
        img.style.margin = ".75rem auto";
      }
    });
  }, 50);
  quill.setSelection(range.index + 1);
}
