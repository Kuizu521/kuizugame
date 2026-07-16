// OpenCV読み込み完了を待つ
cv['onRuntimeInitialized'] = () => {
  document.getElementById("log").innerText = "OpenCV 読み込み完了！\n画像をアップロードしてください。";
};

// 登録画像とURLの対応（相対パスに修正）
const registered = [
  { file: "467fb527f08f855790a971ca6762d269c19b7451-thumb-1200xauto-12974.jpg", url: "https://sites.google.com/ad.reitaku-u.ac.jp/gakusei-jyouhou/%E3%83%9B%E3%83%BC%E3%83%A0?" },
  { file: "WIN_20260611_03_09_54_Pro.jpg", url: "https://weakcat0904.github.io/testgame_b/test.html" }
];

// ログ表示
function log(msg) {
  document.getElementById("log").innerText += msg + "\n";
}

// 画像読み込み
function loadImage(src) {
  return new Promise(resolve => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

// ORB特徴量抽出
function getDescriptors(img) {
  let mat = cv.imread(img);
  cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);

  let orb = new cv.ORB();
  let keypoints = new cv.KeyPointVector();
  let descriptors = new cv.Mat();

  orb.detectAndCompute(mat, new cv.Mat(), keypoints, descriptors);

  mat.delete();
  orb.delete();

  return descriptors;
}

// 類似度計算（マッチ数）
function matchDescriptors(desc1, desc2) {
  let bf = new cv.BFMatcher(cv.NORM_HAMMING, true);
  let matches = new cv.DMatchVector();

  bf.match(desc1, desc2, matches);

  let score = matches.size();
  bf.delete();
  matches.delete();

  return score;
}

// メイン処理
document.getElementById("inputImage").addEventListener("change", async (e) => {
  document.getElementById("log").innerText = "";
  log("① 画像を読み込み中...");

  let file = e.target.files[0];
  let userImg = await loadImage(URL.createObjectURL(file));

  log("② 特徴量を抽出中...");
  let userDesc = getDescriptors(userImg);

  let bestScore = 0;
  let bestURL = null;

  log("③ 登録画像と比較中...");

  for (let item of registered) {
    log(`　→ ${item.file} と比較中...`);
    let regImg = await loadImage(item.file);
    let regDesc = getDescriptors(regImg);

    let score = matchDescriptors(userDesc, regDesc);
    log(`　　マッチ数: ${score}`);

    if (score > bestScore) {
      bestScore = score;
      bestURL = item.url;
    }
  }

  log("④ 判定中...");

  if (bestScore > 10) {  // 閾値を下げて認識しやすく
    log(`⑤ 一致！URLへ移動します → ${bestURL}`);
    window.location.href = bestURL;
  } else {
    log("⑤ 一致する画像が見つかりませんでした");
  }
});
