/**
 * Dice
 * このファイルは QWEL Project の一部です。
 * Part of the QWEL Project © QWEL.DESIGN 2025
 * Licensed under GPL v3 – see https://qwel.design/
 */

class Dice {
  constructor(X = 0, Y = 2, T = 1, F = 2) {
    // 定数
    this.sin30 = Math.sin(Math.PI / 6) * 60;
    this.cos30 = Math.cos(Math.PI / 6) * 60;

    // 状態管理
    this.X = X; // x座標
    this.Y = Y; // y座標
    this.T = T; // 上面
    this.F = F; // 前面 (描画する左面)

    // 描画
    this._draw();

    // イベント登録
    this._handleEvents();
  }

  // 座標を等角投影法 (アイソメトリック図) に変換
  calcX() {
    return this.width / 2 + this.X * this.cos30 + this.Y * this.cos30;
  }

  calcY() {
    return this.height / 2 + this.X * this.sin30 - this.Y * this.sin30;
  }
  
  // T, F の組から R (右面) を求めるルックアップテーブル
  static rightTable = {
    '1,2': 3, '1,3': 5, '1,4': 2, '1,5': 4,
    '2,1': 4, '2,3': 1, '2,4': 6, '2,6': 3,
    '3,1': 2, '3,2': 6, '3,5': 1, '3,6': 5,
    '4,1': 5, '4,2': 1, '4,5': 6, '4,6': 2,
    '5,1': 3, '5,3': 6, '5,4': 1, '5,6': 4,
    '6,2': 4, '6,3': 2, '6,4': 5, '6,5': 3
  };

  // ルックアップテーブルから R (右面) を取得
  getR() {
    const key = `${this.T},${this.F}`;
    return Dice.rightTable[key];
  }

  // 状態を取得
  getState() {
    return {
      x: this.X,
      y: this.Y,
      top: this.T,
      front: this.F,
      right: this.getR()
    };
  }

  // 状態をログで出力
  printState() {
    const { x, y, top, front, right } = this.getState();
    console.log(`X: ${x}, Y: ${y}, Top: ${top}, Front: ${front}, Right: ${right}`);
  }

  // 右に転がす
  rollRight() {
    this.X++;
    const R = this.getR();
    this.T = 7 - R;
    // F は変わらない
  }

  // 左に転がす
  rollLeft() {
    this.X--;
    const R = this.getR();
    this.T = R;
    // F は変わらない
  }

  // 後ろに転がす
  rollBackward() {
    const oldTop = this.T;
    this.Y++;
    this.T = this.F;
    this.F = 7 - oldTop;
  }

  // 前に転がす
  rollForward() {
    const oldTop = this.T;
    this.Y--;
    this.T = 7 - this.F;
    this.F = oldTop;
  }

  _draw() {
    const canvas = document.getElementById('dice');  
    const ctx = canvas.getContext('2d');
    this.width = 720; // Fix
    this.height = 540;
    
    // 背景をリセット
    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // ダイスを描画
    // 描画属性を設定
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#209fdf';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // テキストの描画属性
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 立方体を描画
    ctx.translate(this.calcX(), this.calcY());
    for (let i = 0; i < 3; i ++) {
      ctx.rotate(Math.PI * 2 / 3); // 120度ずつ回転させ、3つの平行四辺形を描く
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.cos30, -this.sin30);
      ctx.lineTo(0, -this.sin30 * 2);
      ctx.lineTo(-this.cos30, -this.sin30);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.stroke();
      if (i == 0) ctx.fillStyle = '#209fdfb3';
      if (i == 1) ctx.fillStyle = '#209fdfd9';
      if (i == 2) ctx.fillStyle = '#209fdfff';
      ctx.fill();
    }

    // 数字を描画
    ctx.fillStyle = '#fff';
    // 上面
    const TX = this.X;
    const TY = this.Y - this.sin30;
    ctx.fillText(this.T, TX, TY);
    // 前面
    const FX = this.X - this.cos30 / 2;
    const FY = this.Y + this.sin30 / 2;
    ctx.fillText(this.F, FX, FY);
    // 右面
    const RX = this.X + this.cos30 / 2;
    const RY = this.Y + this.sin30 / 2;
    ctx.fillText(this.getR(), RX, RY);

    ctx.restore();
  }

  _handleEvents() {
    const controle = document.querySelectorAll('[data-role="roll"]');
    controle.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        const dir = btn.textContent;
        this[`roll${dir}`](); // 文字列からメソッドを取得
        this._draw(); // 再描画
      })
    });
  }
}

new Dice();
