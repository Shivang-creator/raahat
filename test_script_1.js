(() => {
        try {
          const savedTheme = localStorage.getItem("raahat-theme");
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          if (savedTheme === "dark") document.documentElement.dataset.theme = "dark"; else document.documentElement.removeAttribute("data-theme");
        } catch { /* Private browsing can refuse storage; the default theme still works. */ }
      })();