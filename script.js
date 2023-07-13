function limpiarRadioButton(){
    document.querySelectorAll('[name=Tipo]').forEach((x) => x.checked=false);
  }

let radios = document.querySelectorAll("[type='radio']");
   radios.forEach((x)=>{
     x.dataset.val = x.checked;
     x.addEventListener('click',(e)=>{
       let element = e.target;
       if(element.dataset.val == 'false'){
         element.dataset.val = 'true';
         element.checked = true;
       }else{
         element.dataset.val = 'false';
         element.checked = false;
       }
     },true);
   });
