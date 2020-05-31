let doc = api('getSource', {type: "json"})
let id;

function px(mm) {
    return api('unitConvert', {type: 'mm2pixel', value: mm})
}

let pitch = px(7);

function layoutX(skip, count, flip) {
    let out = [];
    for (pos = (skip * pitch); pos < ((skip * pitch) + (count * pitch)); pos += pitch) {
        out.push(pos);
    }
    if (flip) {
        return out.reverse();
    }
    return out;
}

function layout() {
    return [
        {x: px(2), y: px(2), skip: 1, count: 6, rot: 0},
        {x: px(2), y: px(2 + (6 * 1)), skip: 0, count: 8, rot: 180},
        {x: px(2), y: px(2 + (6 * 2)), skip: 0, count: 8, rot: 0},
        {x: px(2), y: px(2 + (6 * 3)), skip: 0, count: 8, rot: 180},
        {x: px(2), y: px(2 + (6 * 4)), skip: 0, count: 8, rot: 0},
        {x: px(2), y: px(2 + (6 * 5)), skip: 0, count: 7, rot: 180},
        {x: px(2), y: px(2 + (6 * 6)), skip: 0, count: 6, rot: 0},
        {x: px(2), y: px(2 + (6 * 7)), skip: 1, count: 4, rot: 180},
        {x: px(77), y: px(2), skip: 1, count: 6, rot: 0},
        {x: px(77), y: px(2 + (6 * 1)), skip: 0, count: 8, rot: 180},
        {x: px(77), y: px(2 + (6 * 2)), skip: 0, count: 8, rot: 0},
        {x: px(77), y: px(2 + (6 * 3)), skip: 0, count: 8, rot: 180},
        {x: px(77), y: px(2 + (6 * 4)), skip: 0, count: 8, rot: 0},
        {x: px(77), y: px(2 + (6 * 5)), skip: 1, count: 7, rot: 180},
        {x: px(77), y: px(2 + (6 * 6)), skip: 2, count: 6, rot: 0},
        {x: px(77), y: px(2 + (6 * 7)), skip: 2, count: 4, rot: 180},
    ].map(row => (layoutX(row.skip, row.count, row.rot == 180).map(x => ({
        x: x + row.x,
        y: row.y,
        rot: row.rot
    })))).flat();
}

let positions = layout();

console.log({positions});

let orderedLeds = [];
// map leds by gid
for (const [gId, fp] of Object.entries(doc.FOOTPRINT)) {
    // leds only
    if (!fp.head.c_para.includes("APA102"))
        continue
    for (const [gId, tObj] of Object.entries(fp.TEXT)) {
        if (tObj.type == "P") {
            orderedLeds[parseInt(tObj.text.replace(/^U/, ''))] = fp.head.gId;
        }
    }
}
console.log({orderedLeds});

let i = 1;
positions.forEach((position) => {
    if (i > orderedLeds.length) {
        console.error("out of leds");
        return;
    }
    try {
        api('moveObjsTo', {
            objs: [{gId: orderedLeds[i]}],
            x: position.x + px(1000),
            y: position.y + px(600),
        });
    } catch (e) {
    }
    try {
        api('rotate', {ids: [orderedLeds[i]], degree: position.rot});
    } catch (e) {
    }
    i++;
});