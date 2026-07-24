cv['onRuntimeInitialized'] = () => {
    document.getElementById("log").innerText = "OpenCV 読み込み完了！";
};

document.getElementById("inputImage").addEventListener("change", async (e) => {
    document.getElementById("log").innerText = "認識中...";

    const file = e.target.files[0];
    const userImg = await loadImage(URL.createObjectURL(file));
    const userDesc = getDescriptors(userImg);

    // ★ 固定しきい値方式
    const targets = [
        { img: "467fb527f08f855790a971ca6762d269c19b7451-thumb-1200xauto-12974.jpg", url: "https://www.reitaku-u.ac.jp/", threshold: 120 },
        { img: "OIP.jpg", url: "https://rp.reitaku-u.ac.jp/uprx/up/bs/bsd007/Bsd00701.xhtml", threshold: 120 },
        { img: "hiiragi.jpg", url: "https://cite.reitaku-u.ac.jp/", threshold: 120 }
    ];


    let log = "";
    let bestScore = 0;
    let bestURL = null;

    for (const t of targets) {
        try {
            const targetImg = await loadImage(t.img);
            const targetDesc = getDescriptors(targetImg);

            const score = matchDescriptors(userDesc, targetDesc);

            log += `${t.img} のマッチ数: ${score}\n`;
            document.getElementById("log").innerText = log;

            // ★ 固定しきい値で判定
            if (score >= t.threshold && score > bestScore) {
                bestScore = score;
                bestURL = t.url;
            }

        } catch (err) {
            log += `${t.img} の読み込みに失敗しました\n`;
            document.getElementById("log").innerText = log;
        }
    }

    if (bestURL) {
        window.location.href = bestURL;
    } else {
        document.getElementById("log").innerText += "\n一致する画像がありませんでした";
    }
});

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject("画像読み込み失敗: " + src);
        img.src = src;
    });
}

function getDescriptors(img) {
    const mat = cv.imread(img);
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);

    const orb = new cv.ORB();
    const keypoints = new cv.KeyPointVector();
    const descriptors = new cv.Mat();

    orb.detectAndCompute(mat, new cv.Mat(), keypoints, descriptors);

    mat.delete();
    orb.delete();

    return descriptors;
}

function matchDescriptors(desc1, desc2) {
    const bf = new cv.BFMatcher(cv.NORM_HAMMING, true);
    const matches = new cv.DMatchVector();

    bf.match(desc1, desc2, matches);

    const score = matches.size();

    bf.delete();
    matches.delete();

    return score;
}
