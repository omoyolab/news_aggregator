class Alert {
    constructor() {
      this.btn = document.querySelector('.btn');
      this.header = document.querySelector('.header');
      this.events();
    }
  
    events() {
      this.btn.addEventListener('click', () => this.showAlertAndChangeColor());
    }
  
    showAlertAndChangeColor() {
      alert('color changed');
      this.header.style.color = 'blue';
    }
  }
  
  export default Alert;
  