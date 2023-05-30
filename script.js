// const previewContainer = document.querySelector(".preview-container");
const scaleFactor = 0.75;
const departmentArea = document.querySelector(".department-area");
const departmentList = document.querySelector(".department-list");
const componentArea = document.querySelector(".component-area");
const packageArea = document.querySelector(".package-area");
const previewArea = document.querySelector(".preview-area");
// const component = document.querySelector(".component");
let previewComponents = [];

let articleDatabaseAry = [];
let packageDatabaseAry = [];
const A4Height = previewArea.getBoundingClientRect().height / scaleFactor; // A4 纸张高度，单位为毫米
let currentHeight = 0; // 获取当前预览区域的高度

// console.log("A4 height = " + A4Height);
function addComponentToPreview(component) {
     previewComponents.push(component);
     component.addEventListener("dragstart", () => {
          // Adding dragging class to item after a delay
          setTimeout(() => component.classList.add("dragging"), 0);
     });
     // Removing dragging class from item on dragend event
     component.addEventListener("dragend", () => component.classList.remove("dragging"));

     let addingObj = articleDatabaseAry.find((obj) => {
          return obj.uniqueid === component.dataset.uniqueid;
     });
     // console.log(addingObj);
     let newArticleContent = document.createElement("p");
     let tmpHtml = "";
     let tmpContentAry = addingObj.content.split(/[\n\r\u0003]+/);
     let listing = false;
     // console.log(tmpContentAry);
     for (let i = 0; i < tmpContentAry.length; i++) {
          if (tmpContentAry[i].substr(0, 1).match(/[▪①]/)) {
               if (!listing) {
                    if (tmpContentAry[i].substr(0, 1).match(/[▪]/)) {
                         listing = "ul";
                    } else if (tmpContentAry[i].substr(0, 1).match(/[①]/)) {
                         listing = "ol";
                    }
                    tmpHtml += "<" + listing + ">";
               }
               tmpHtml += tmpContentAry[i].replace(/[▪①]/, "<li>") + "</li>";
          } else {
               // console.log(listing);
               if (listing) {
                    tmpHtml += "</" + listing + ">";
               } else {
                    if (i > 0) {
                         tmpHtml += "<br>";
                    }
               }
               listing = false;
               tmpHtml += tmpContentAry[i];
          }
          if (i == tmpContentAry.length - 1 && listing) {
               tmpHtml += "</" + listing + ">";
          }
     }

     newArticleContent.innerHTML = tmpHtml;
     component.appendChild(newArticleContent);

     let deleteBtn = document.createElement("button");
     deleteBtn.classList.add("delete-button");
     deleteBtn.classList.add("btn");
     deleteBtn.classList.add("btn-sm");
     deleteBtn.classList.add("btn-danger");
     deleteBtn.textContent = "X";
     component.appendChild(deleteBtn);

     deleteBtn.style.display = "none";
     component.addEventListener("mouseenter", function () {
          deleteBtn.style.display = "block";
     });

     component.addEventListener("mouseleave", function () {
          deleteBtn.style.display = "none";
     });

     deleteBtn.addEventListener("click", function () {
          componentArea.querySelector("[data-uniqueid=" + component.dataset.uniqueid + "]").classList.remove("usedComponent");
          component.remove();
          checkPackUsed();
          adjustPreviewHeight();
     });

     previewArea.appendChild(component);
     checkPackUsed();
     adjustPreviewHeight();
}

function checkPackUsed() {
     packageDatabaseAry.forEach((e) => {
          let packArticleAry = e.component_ids.split(/,[ ]*/);
          let matched = true;
          packArticleAry.forEach((k) => {
               if (!previewArea.querySelector("[data-uniqueid=" + k + "]")) {
                    matched = false;
                    return;
               }
          });
          if (matched) {
               document.querySelector("[data-package_title=" + e.package_title + "]").classList.add("usedComponent");
          } else {
               document.querySelector("[data-package_title=" + e.package_title + "]").classList.remove("usedComponent");
          }
     });
}

function adjustPreviewHeight() {
     let allPreviewComponent = previewArea.querySelectorAll(".previewComponent");
     let totalHeight = 0;
     allPreviewComponent.forEach((e) => {
          totalHeight += e.offsetHeight + 20;
     });

     previewArea.style.height = `${Math.ceil(totalHeight / A4Height) * A4Height}px`;
     // console.log();
     // console.log(previewArea.style.height * scaleFactor);
     // console.log(document.querySelector(".preview-container").style.height);
     document.querySelector(".preview-container").style.height = Number(previewArea.style.height.match(/[0-9.]*/)) * scaleFactor + "px";
}

const printBtn = document.querySelector("#print-btn");
const resetBtn = document.querySelector("#reset-btn");

// // 將文章元件加入預覽區
// function addComponentToPreview(component) {
//      previewArea.appendChild(component.cloneNode(true));
// }

// 監聽文章元件點擊事件，將元件加入預覽區
componentArea.addEventListener("click", (event) => {
     const component = event.target.closest(".component");
     if (component && !previewArea.querySelector("[data-uniqueid=" + component.dataset.uniqueid + "]")) {
          component.dataset.used = true;
          component.disable = true;
          component.classList.add("usedComponent");
          const uniqueid = component.dataset.uniqueid;
          const newComponent = document.createElement("div");
          newComponent.classList.add("component");
          newComponent.classList.add("previewComponent");
          newComponent.dataset.uniqueid = uniqueid;
          newComponent.draggable = "true";
          newComponent.innerHTML = component.innerHTML;
          newComponent.querySelector(".article-content-data-preview").remove();
          addComponentToPreview(newComponent);
     }
});
packageArea.addEventListener("click", (event) => {
     const component = event.target.closest(".package");
     if (component) {
          let addingObj = packageDatabaseAry.find((obj) => {
               return obj.package_title === component.dataset.package_title;
          });

          let addingObj_component_ids = addingObj.component_ids.split(/,[ ]*/);

          // if (addingObj_component_ids[0].slice(-2) == "00") {
          //      let k = 1;
          //      let articles = articleDatabaseAry.filter((e) => {
          //           return e.uniqueid.match(addingObj_component_ids[0].substring(0, addingObj_component_ids[0].length - 2));
          //      });
          //      articles.forEach((e) => {
          //           document.querySelector('[data-uniqueid="' + e.uniqueid + '"]').click();
          //      });
          // } else {
          for (let i = 0; i < addingObj_component_ids.length; i++) {
               document.querySelector('[data-uniqueid="' + addingObj_component_ids[i] + '"]').click();
          }
          // }
     }
});
departmentArea.addEventListener("click", (event) => {
     const component = event.target.closest(".department");
     if (component) {
          let departAs = departmentArea.querySelectorAll(".dropdown-item");
          departAs.forEach((e) => {
               e.classList.remove("selectedDepartment");
          });
          console.log(document.getElementById("department-title"));
          document.getElementById("department-title").innerText = "選取分科: " + component.dataset.department;
          // component.classList.add("selectedDepartment");
          let packageDivs = packageArea.querySelectorAll(".component");

          packageDivs.forEach((e) => {
               if (e.dataset.department == component.dataset.department) {
                    e.hidden = false;
               } else {
                    e.hidden = true;
               }
          });
          let componentDivs = componentArea.querySelectorAll(".component");
          componentDivs.forEach((e) => {
               if (e.dataset.department == component.dataset.department) {
                    e.hidden = false;
               } else {
                    e.hidden = true;
               }
          });
     }
});

// 列印預覽區
printBtn.addEventListener("click", () => {
     const printWindow = window.open("", "_blank");
     printWindow.document.write("<html><head><title>列印預覽</title></head><body>");
     printWindow.document.write(
          '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ"	crossorigin="anonymous"/><link rel="stylesheet" href="style.css" /><link rel="stylesheet" href="style_print.css" />'
     );
     printWindow.document.write(previewArea.outerHTML);
     printWindow.document.write("</body></html>");
     printWindow.document.close();
     printWindow.print();
});
resetBtn.addEventListener("click", () => {
     previewArea.querySelectorAll("button").forEach((e) => {
          e.click();
     });
});

//databse reading
const dataSheetUrl = "https://script.google.com/macros/s/AKfycbzVTr_Gjy0E6nQAB8akkOupp9LLhnl06fKmLVPWwcDdEvKYV-HWUb3xWRXVNx1jxpPppA/exec";
document.addEventListener("DOMContentLoaded", readInDatabase);
function readInDatabase() {
     console.log("reading");
     // localStorage.clear();
     if (localStorage.articleDatabaseAry && localStorage.packageDatabaseAry && localStorage.departmentDatabaseAry) {
          // console.log(localStorage.packageDatabaseAry);
          articleDatabaseAry = JSON.parse(localStorage.articleDatabaseAry);
          packageDatabaseAry = JSON.parse(localStorage.packageDatabaseAry);
          departmentDatabaseAry = JSON.parse(localStorage.departmentDatabaseAry);
          init();
          // createArticleDatabase(articleDatabaseAry);
          // createPackages(packageDatabaseAry);
     }
     fetch(dataSheetUrl)
          .then((res) => {
               return res.json();
          })
          .then((data) => {
               console.log(data);
               let needToUpdate = false;
               if (
                    JSON.stringify(articleDatabaseAry) != JSON.stringify(data.data[0]) ||
                    JSON.stringify(packageDatabaseAry) != JSON.stringify(data.data[1]) ||
                    JSON.stringify(departmentDatabaseAry) != JSON.stringify(data.data[2])
               ) {
                    needToUpdate = true;
               }
               articleDatabaseAry = data.data[0];
               packageDatabaseAry = data.data[1];
               departmentDatabaseAry = data.data[2];
               localStorage.articleDatabaseAry = JSON.stringify(articleDatabaseAry);
               localStorage.packageDatabaseAry = JSON.stringify(packageDatabaseAry);
               localStorage.departmentDatabaseAry = JSON.stringify(departmentDatabaseAry);
               if (needToUpdate) {
                    init();
               }
          });
}

function init() {
     try {
          let originalComponent = document.querySelector(".left-column").querySelectorAll(".component");
          originalComponent.forEach((e) => {
               e.remove();
          });
          departmentList.innerHTML = "";
          createArticleDatabase(articleDatabaseAry);
          createPackages(packageDatabaseAry);
          createDepartments(departmentDatabaseAry);
          const loader = document.querySelectorAll(".loader");
          loader.forEach((e) => {
               e.remove();
          });
     } catch (err) {
          console.log("Err at line " + err.line + "\n " + err);
          localStorage.clear();
     }
}

function createDepartments(departmentData) {
     departmentData.forEach((element) => {
          // console.log(element.department);
          let newDepartmentComponent = document.createElement("li");
          newDepartmentComponent.classList = "";
          departmentList.appendChild(newDepartmentComponent);

          let newDepartmentTitle = document.createElement("a");
          newDepartmentTitle.classList = "dropdown-item department";
          newDepartmentTitle.innerText = element.department;
          newDepartmentComponent.appendChild(newDepartmentTitle);
          // departmentList.appendChild(newdepartmentComponent);
          // newdepartmentComponent.innerText = element.department_title;
          newDepartmentTitle.dataset.department = element.department;
     });
}
function createPackages(packageData) {
     packageData.forEach((element) => {
          try {
               let newPackageComponent = document.createElement("div");
               newPackageComponent.classList = "component btn-component package";
               let articleIds = [];
               let articleTitles = [];

               if (element.component_ids.slice(-2) == "00") {
                    let articles = articleDatabaseAry.filter((e) => {
                         return e.uniqueid.match(element.component_ids.substring(0, element.component_ids.length - 2));
                    });
                    articles.forEach((e) => {
                         articleIds.push(e.uniqueid);
                    });
                    element.component_ids = articleIds.join(", ");
               }

               let articleComponentIDs = element.component_ids.split(/,[ ]*/);

               for (let i = 0; i < articleComponentIDs.length; i++) {
                    let curEle = articleDatabaseAry.find((obj) => {
                         return obj.uniqueid === articleComponentIDs[i];
                    });
                    articleTitles.push(curEle.title);
               }

               newPackageComponent.title = articleTitles.join("、").replace(/[？?]、/g, "? ");

               packageArea.appendChild(newPackageComponent);
               let newArticleTitle = document.createElement("h3");
               newArticleTitle.innerText = element.package_title;
               newPackageComponent.appendChild(newArticleTitle);
               // packageArea.appendChild(newPackageComponent);
               // newPackageComponent.innerText = element.package_title;
               newPackageComponent.dataset.package_title = element.package_title;
               newPackageComponent.dataset.department = element.department;
               let newPackageContent = document.createElement("p");
               newPackageContent.classList = "article-content-data-preview";
               newPackageContent.innerText = newPackageComponent.title.length > 25 ? newPackageComponent.title.substr(0, 22) + "..." : newPackageComponent.title;
               newPackageComponent.appendChild(newPackageContent);
          } catch (e) {
               console.log(e + "\n" + e.line);
          }
     });
}

function createArticleDatabase(articleData) {
     articleData.forEach((element) => {
          let newArticleComponent = document.createElement("div");
          newArticleComponent.classList = "component btn-component";
          newArticleComponent.title = element.content;
          componentArea.appendChild(newArticleComponent);
          let newArticleTitle = document.createElement("h3");
          newArticleTitle.innerText = element.title;
          newArticleComponent.appendChild(newArticleTitle);
          newArticleComponent.dataset.uniqueid = element.uniqueid;
          newArticleComponent.dataset.department = element.department;
          let newArticleContent = document.createElement("p");
          newArticleContent.classList = "article-content-data-preview";
          newArticleContent.innerText = element.content.replace(/[\n\r]/g, "").substr(0, 40) + "...";
          newArticleComponent.appendChild(newArticleContent);
          newArticleComponent.dataset.uniqueid = element.uniqueid;
          newArticleComponent.dataset.department = element.department;
     });
}

const initSortableList = (e) => {
     e.preventDefault();
     const draggingItem = document.querySelector(".dragging");
     // Getting all items except currently dragging and making array of them
     let siblings = [...previewArea.querySelectorAll(".previewComponent:not(.dragging)")];
     // Finding the sibling after which the dragging item should be placed
     let nextSibling = siblings.find((sibling) => {
          return document.querySelector(".right-container").scrollTop / scaleFactor + e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
     });
     // Inserting the dragging item before the found sibling
     previewArea.insertBefore(draggingItem, nextSibling);
};
previewArea.addEventListener("dragover", initSortableList);
previewArea.addEventListener("dragenter", (e) => e.preventDefault());

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
     return new bootstrap.Tooltip(tooltipTriggerEl);
});

const testData =
     '{"status":"success","data":[[{"department":"風免","category":"疾病總覽","title":"疾病總覽","content":"---","source":"","create date":"","last reviewer":"","last update date":"","uniqueid":"meta01"},{"department":"風免","category":"疾病細節","title":"疾病細節","content":"----","source":"","create date":"","last reviewer":"","last update date":"","uniqueid":"meta02"},{"department":"風免","category":"藥物使用注意事項","title":"類固醇","content":"▪類固醇是一類常用於治療風濕免疫疾病的藥物，具有抗炎和免疫抑制作用。然而，在使用類固醇時，患者需了解其常見副作用並採取必要的預防措施。\\n▪常見副作用包括：水腫、高血壓、高血糖、骨質疏鬆、易感染、皮膚變薄和潰瘍。在使用類固醇時，患者應遵循醫生的建議，並密切觀察可能出現的副作用。若出現持續或惡化的副作用，應及時諮詢醫生。\\n▪在使用類固醇期間，患者應注意以下事項：1. 控制鹽分攝入，以降低水腫和高血壓的風險。2. 保持健康飲食，並定期運動以防止骨質疏鬆。3. 緊密監測血糖，並在出現高血糖時及時控制。4. 避免接觸感染源，並保持良好的個人衛生以降低感染風險。5. 如需停藥或調整劑量，請遵循醫生的建議，避免突然停止使用，以免產生戒斷症狀。","source":"GPT","create date":"","last reviewer":"鼎淵","last update date":"2023-04-24T16:00:00.000Z","uniqueid":"meta05"},{"department":"風免","category":"藥物使用注意事項","title":"消炎藥","content":"▪非類固醇抗炎藥（NSAIDs）是一類常用於治療風濕免疫疾病的藥物，具有抗炎和止痛作用。在使用NSAIDs時，患者需了解其可能的副作用並採取相應的預防措施。\\n▪常見副作用包括：胃腸道不適、胃潰瘍、消化道出血、腎臟功能受損和高血壓。在使用NSAIDs時，患者應遵循醫生的建議，並密切關注可能出現的副作用。若出現持續或惡化的副作用，應及時諮詢醫生。\\n▪在使用NSAIDs期間，患者應注意以下事項：1. 遵循醫生的劑量和用藥時間，避免過量使用。2. 飯後或與食物一起服用，以減少胃腸道不適。3. 若有胃腸道疾病史，應在醫生指導下使用。4. 定期檢查腎功能和血壓，以監測潛在問題。5. 告知醫生您正在使用的其他藥物，以防止藥物相互作用。","source":"GPT","create date":"","last reviewer":"鼎淵","last update date":"2023-04-24T16:00:00.000Z","uniqueid":"meta06"},{"department":"風免","category":"藥物使用注意事項","title":"奎寧","content":"▪Plaquenil（氫氯喹）是一種常用於治療自體免疫性疾病，如紅斑狼瘡和類風濕性關節炎的藥物。在服用Plaquenil時，請遵循醫生建議的劑量和服用時間。常見的不良反應包括腸胃不適、頭痛和眩暈。若副作用持續或惡化，請尋求醫療建議。服藥時需注意：孕婦和哺乳期婦女在使用前應諮詢醫生；告知醫生您正在使用的其他藥物，以防止藥物相互作用；定期進行眼科檢查，以監測可能的視網膜毒性。在服用Plaquenil時，請始終遵循醫生的指導，如有任何疑慮，請尋求專業建議。","source":"GPT","create date":"","last reviewer":"鼎淵","last update date":"2023-04-24T16:00:00.000Z","uniqueid":"meta07"},{"department":"風免","category":"藥物使用注意事項","title":"滅殺除炎 + 葉酸","content":"▪甲氨蝶呤（Methotrexate，簡稱MTX）是一種常用於治療風濕性關節炎、乾癬等疾病的免疫抑制藥物。服用MTX時，需遵循醫生建議的劑量與頻率。常見副作用包括口腔潰瘍、噁心、腹痛、疲勞等。若副作用嚴重，應立即就診。注意事項包括：孕婦、哺乳期婦女應避免使用；告知醫生其他正在使用的藥物以防相互作用；定期檢查肝、腎功能和血細胞計數以監測藥物毒性；保持充足的葉酸攝入以減少副作用。在使用MTX時，請嚴格遵循醫生的建議，如有疑問，及時向醫生諮詢。","source":"GPT","create date":"","last reviewer":"鼎淵","last update date":"2023-04-24T16:00:00.000Z","uniqueid":"meta08"}],[{"package_title":"初診病人","component_ids":"meta01,meta05, meta08"}]]}';
