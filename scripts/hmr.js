if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => {
      window.location.reload()
    })
  }
  
  