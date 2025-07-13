// sample data query param:
// %7B"title"%3A"Some%20Timeline"%2C"items"%3A%5B%7B"timestamp"%3A1752343185842%2C"description"%3A"View%20the%20docs%20at%20https%3A%2F%2Fv.gd%2Fmytown"%2C"title"%3A"Example%20Really%20Really%20Looooooooooooong%20Name%20Something%20Somewhat"%7D%2C%7B"timestamp"%3A1752343815038%2C"title"%3A"r"%7D%2C%7B"timestamp"%3A1754668800000%2C"title"%3A"e"%7D%5D%7D

function replaceInnerHTML(...elemList) {
    for (let elem of elemList) {
        elem.innerHTML = elem.innerHTML.replaceAll(
            /https\:\/\/v\.gd\/[a-zA-Z0-9_]+/g,
            `<a href="$&-">$&</a>`
        );
    }
}

function main() {
    let data;
    try {
        data = JSON.parse(new URL(location.href).searchParams.get("data"));
    } catch(e) {
        console.error(e);
        throw new Error("Malformed data");
    }
    if (!data) throw new Error("No data provided");
    if (!data.title) throw new Error("Malformed data");
    console.log(data);

    {
        const editLink = document.querySelector("#edit-timeline-link");
        const urlObj = new URL("./editor.html", location.href);
        urlObj.searchParams.set("data", JSON.stringify(data));
        editLink.href = urlObj.href;
    }

    const items = data.items.map(thisItem => {
        if (!thisItem.timestamp || !thisItem.title) throw new Error("Malformed data");
        thisItem.timestamp = new Date(thisItem.timestamp);
        return thisItem;
    }).sort((a, b) => a.timestamp - b.timestamp);

    document.title = document.querySelector("#timeline-title").textContent = data.title.trim();
    if (data.description.trim()) document.querySelector("#timeline-description").innerText = data.description.trim();

    const container = document.querySelector("#timeline");
    let prevDate = "";
    for (let item of items) {
        let itemDate = ((timestamp) => {
            return `${
                timestamp.getDate().toString().padStart(2, "0")
            } ${
                [
                    "Jan", "Feb", "Mar", "Apr",
                    "May", "Jun", "Jul", "Aug",
                    "Sep", "Oct", "Nov", "Dec"
                ][timestamp.getMonth()]
            } ${
                timestamp.getFullYear()
            }`;
        })(item.timestamp);

        if (prevDate !== itemDate) {
            const dateBox = document.createElement("div");
            dateBox.classList.add("date");
            dateBox.textContent = itemDate;
            container.append(dateBox);
            prevDate = itemDate;
        }

        const itemBox = document.createElement("div");
        itemBox.classList.add("item");

        const timeInd = document.createElement("div");
        timeInd.classList.add("time");
        timeInd.textContent = ((d) => {
            const p = (n => n.toString().padStart(2, "0"));
            return `${p(d.getHours())}${p(d.getMinutes())}`;
        })(item.timestamp);
        itemBox.append(timeInd);

        const title = document.createElement("div");
        title.classList.add("item-title");
        title.textContent = item.title.trim();
        itemBox.append(title);

        replaceInnerHTML(timeInd, title);

        if (item.description) {
            const desc = document.createElement("div");
            desc.classList.add("item-desc");
            desc.innerText = item.description.trim();
            itemBox.append(desc);
            replaceInnerHTML(desc);
        }

        container.append(itemBox);
    }

}

main();