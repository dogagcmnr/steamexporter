(function () {
    const waitForPageLoad = (callback) => {
      if (document.readyState === "complete") {
        callback();
      } else {
        window.addEventListener("load", callback);
      }
    };
  
    waitForPageLoad(() => {
      const targetDiv = document.querySelector(".wallet_history_click_hint");
      if (!targetDiv || document.getElementById("exportHistoryBtn")) return;
  
      const exportBtn = document.createElement("button");
      exportBtn.innerText = "Export History";
      exportBtn.id = "exportHistoryBtn";
      Object.assign(exportBtn.style, {
        float: "right",
        marginLeft: "10px",
        backgroundColor: "#1a9fff",
        color: "#fff",
        border: "none",
        padding: "6px 10px",
        cursor: "pointer",
        fontSize: "12px",
        borderRadius: "4px"
      });
  
      targetDiv.style.overflow = "hidden";
      targetDiv.appendChild(exportBtn);
  
      exportBtn.addEventListener("click", async () => {
        exportBtn.disabled = true;
        exportBtn.innerText = "Loading...";
        await autoLoadAllEntries();
        exportBtn.innerText = "Exporting...";
        const csv = extractTableAsCSV();
        triggerDownload(csv, "steam_purchase_history.csv");
        exportBtn.innerText = "Export Done ✅";
      });
    });
  
    async function autoLoadAllEntries() {
      const delay = (ms) => new Promise(res => setTimeout(res, ms));
      while (true) {
        const loadMoreBtn = document.querySelector("#load_more_button");
        if (loadMoreBtn && loadMoreBtn.style.display !== "none") {
          loadMoreBtn.click();
          await delay(1000);
        } else {
          break;
        }
      }
    }
  
    function extractTableAsCSV() {
        const table = document.querySelector(".wallet_history_table");
        if (!table) return "";
      
        const csvData = [];
      
        const headerRows = table.querySelectorAll("thead tr");
        if (headerRows.length >= 2) {
          const row1 = Array.from(headerRows[0].querySelectorAll("th"));
          const row2 = Array.from(headerRows[1].querySelectorAll("th"));
          const header = [];
      
          for (let th of row1) {
            const text = th.innerText.trim();
            const colspan = parseInt(th.getAttribute("colspan")) || 1;
            const rowspan = parseInt(th.getAttribute("rowspan")) || 1;
      
            if (colspan === 1) {
              header.push(text);
            } else if (colspan > 1 && row2.length > 0) {
              for (let i = 0; i < colspan; i++) {
                const subtext = row2[i]?.innerText.trim() || "";
                header.push(`${text} ${subtext}`);
              }
            }
          }
      
          csvData.push(header.map(h => `"${h.replace(/"/g, '""')}"`).join(","));
        }
      
        const rows = Array.from(table.querySelectorAll("tbody tr"));
        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll("td"));
          const rowData = [];
      
          for (const cell of cells) {
            const divs = cell.querySelectorAll("div");
            let text;
      
            if (divs.length > 0) {
              text = Array.from(divs)
                .map(div => div.innerText.trim())
                .join(" / ");
            } else {
              text = cell.innerText.trim();
            }
      
            rowData.push(`"${text.replace(/"/g, '""')}"`);
          }
      
          if (rowData.length > 0) {
            csvData.push(rowData.join(","));
          }
        }
      
        return csvData.join("\n");
      }

    function triggerDownload(csvData, filename) {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  })();  
