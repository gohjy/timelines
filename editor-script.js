const form = document.querySelector("#main-form");
const itemInputHolder = document.querySelector(".item-input-holder");

const itemInputTemplate = `
<div class="actions">
    <input type="button" value="Remove item" class="remove-item-btn">
</div>
<div class="break"></div>
<div class="flex">
    Title:&nbsp;
    <input type="text" class="full-width item-title-input" required>
</div>
<div class="break"></div>
<div>
    Date &amp; time:
    <input type="datetime-local" class="item-datetime-input" required>
</div>
<div class="break"></div>
<details>
    <summary>Description (optional):</summary>
    <textarea rows="3" class="item-desc-input"></textarea>
</details>`;

function createNewItemInput() {
    const itemInputDiv = document.createElement("div");
    itemInputDiv.classList.add("item-input");
    itemInputDiv.innerHTML = itemInputTemplate;

    const removeBtn = itemInputDiv.querySelector(".remove-item-btn");
    removeBtn.addEventListener("click", () => {
        itemInputDiv.remove();
    });

    return itemInputDiv;
}

const addBtn = document.querySelector("#add-new-item-btn");
addBtn.addEventListener("click", () => {
    itemInputHolder.append(createNewItemInput());
});
if (!new URL(location.href).searchParams.has("data")) addBtn.click();

const titleInput = document.querySelector("#timeline-title-input");
const descInput = document.querySelector("#timeline-desc-input");

function handleSubmit() {
    const timelineData = {};
    timelineData.title = titleInput.value.trim();
    timelineData.description = descInput.value.trim() || undefined;

    const timelineItems = [];
    for (let itemElem of document.querySelector(".item-input-holder").children) {
        const thisItem = {};
        thisItem.title = itemElem.querySelector(".item-title-input").value.trim();
        thisItem.description = itemElem.querySelector(".item-desc-input").value.trim() || undefined;
        thisItem.timestamp = +new Date(itemElem.querySelector(".item-datetime-input").value);
        timelineItems.push(thisItem);
    }
    timelineData.items = timelineItems;

    const jsonKey = JSON.stringify(timelineData);
    const timelineUrl = new URL("./viewer.html", location.href);
    timelineUrl.searchParams.set("data", jsonKey);

    const link = document.createElement("a");
    link.style.color = "transparent";
    link.style.fontSize = "1";
    link.style.position = "absolute";
    link.href = timelineUrl;
    document.body.append(link);
    link.click();
    link.remove();
}

form.addEventListener("submit", handleSubmit);

try {
    (function() {
        if (new URL(location.href).searchParams.has("data")) {
            const jsonData = JSON.parse(new URL(location.href).searchParams.get("data"));
            if (!jsonData) throw new Error("No data in data query param");
            if (!jsonData.title.trim()) throw new Error("Malformed data");

            titleInput.value = jsonData.title.trim();
            if (jsonData.description?.trim()) descInput.value = jsonData.description.trim();

            const items = jsonData.items.map(thisItem => {
                if (!thisItem.timestamp || !thisItem.title.trim()) throw new Error("Malformed data");
                thisItem.timestamp = new Date(thisItem.timestamp);
                return thisItem;
            }).sort((a, b) => a.timestamp - b.timestamp);

            for (let item of items) {
                const itemInputDiv = createNewItemInput();
                itemInputDiv.querySelector(".item-title-input").value = item.title.trim();

                const pF = x => x.toString().padStart(2, "0");
                itemInputDiv.querySelector(".item-datetime-input").value = `${item.timestamp.getFullYear()}-${pF(item.timestamp.getMonth() + 1)}-${pF(item.timestamp.getDate())}T${pF(item.timestamp.getHours())}:${pF(item.timestamp.getMinutes())}`;

                
                if (item.description?.trim()) itemInputDiv.querySelector(".item-desc-input").value = item.description?.trim();
                itemInputHolder.append(itemInputDiv);
            }
        }
    })();
} catch(e) {
    console.error(e);
    const newUrl = new URL(location.href);
    newUrl.searchParams.delete("data");
    location.replace(newUrl.href);
}