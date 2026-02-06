document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.keyCode === 85) { 
      e.preventDefault(); 
     
    }
  });

  document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

document.onkeydown = function(e) {
 
  if (event.keyCode === 123) {
    return false;
  }
  
  if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode === 85) {
    return false;
  }
};