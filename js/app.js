'use strict';
const _EMOTIONS = {
    "positive": [],
    "negative": [],
    "anger": [],
    "anticipation": [],
    "disgust": [],
    "fear": [],
    "joy": [],
    "sadness": [],
    "surprise": [],
    "trust": []
};

let extractWords = function (text) {
    let text_2 = text.toLowerCase();
    let res = text_2.split(/\W+/);
    let result = res.filter(word => word.length > 1);
    //console.log(result);
    return result;
}

function findSentimentWords(inputArray) {
    for (let i of inputArray) {
        for (let j in _SENTIMENTS[i]) {
            for (let k in _EMOTIONS) {
                if (j === k)
                    _EMOTIONS[k].push(i);
            }
        }
    }
 //   console.log(_EMOTIONS);
}

// let m = extractWords(_SAMPLE_TWEETS[1].text);
// let k = extractWords("lovely day");
//console.log(m);
// findSentimentWords(m);
// findSentimentWords(k)
// console.log(_SAMPLE_TWEETS[0].text);

function analyzeTweets(array) {
    let count = 0;
    let words = [];
    for (let i = 0; i < array.length; i++) {
        words.push(extractWords(array[i].text));
        count = count + (words[i].length);
    }

    let sentiments = [];
    for (let i = 0; i < words.length; i++) {
        findSentimentWords(words[i]);
    }
    sentiments.push(_EMOTIONS);
    
    for (let i in sentiments[0]) {
        sentiments[0][i].sort();
    }
 
  //  console.log(sentiments[0])
    let results = {
        "positive": [],
        "negative": [],
        "anger": [],
        "anticipation": [],
        "disgust": [],
        "fear": [],
        "joy": [],
        "sadness": [],
        "surprise": [],
        "trust": []
    };
    let freq = {};
    for (let i in sentiments[0]) {
        for (let j of sentiments[0][i]) {
            //console.log(j);
            if (!freq[j]) {
                freq[j] = 1;
            } else
                freq[j] += 1;
        }
         console.log(freq);
        let sortable = [];
        for (let m in freq) {
            sortable.push([m, freq[m]]);
        }
        sortable.sort((a, b) => (a[1] - b[1]));
        console.log(sortable);
        freq = {};
        for (let g = 0; g < sortable.length; g++) {
            freq[sortable[g][0]] = sortable[g][1];
        }
        console.log(freq);
        let max = 0;
        for (let k in freq) {
            if (freq[k] > max)
                max = freq[k];
        }
        console.log(max)
        for (let k in freq) {
            if (freq[k] === max && results[i].length < 3) {
                if (results.hasOwnProperty(i))
                    results[i].push(k);
            }
        }
        console.log(results)
        for (let k in freq) {
            if (results[i].length < 3 && freq[k] === max - 1) {
                if (results.hasOwnProperty(i))
                    results[i].push(k);
            }

         }
         freq = {};
     }

    let obj = {
        "words": results,
        "percentage": []
    }
    console.log(sentiments);
    console.log(sentiments[0].positive.length);
    for (let i in sentiments[0]) {
        obj.percentage.push((sentiments[0][i].length / count) * 100);
    }
    console.log(obj);
    return obj;
}
let data = analyzeTweets(_SAMPLE_TWEETS);
console.log(data)
console.log();
let showStats = (obj)=>{
    
    let keys = Object.keys(obj.words);
    let percentage = obj.percentage;
    let commonWords = Object.values(obj.words);
    let table = document.getElementById('sentiment-table');
    for(let i =0;i<keys.length;i++){
        let row = document.createElement('tr');
        for(let j=0;j<3;j++){
            let cell = document.createElement('td');
            let content;
            switch(j){
                case 0:
                content = document.createTextNode(keys[i]);
                cell.appendChild(content);
                row.appendChild(cell);
                break;
                case 1:
                let mynumeral = numeral(percentage[i]).format('0.00');
                content = document.createTextNode(mynumeral+'%');
                cell.appendChild(content);
                row.appendChild(cell);
                break;
                case 2:
                content = document.createTextNode(commonWords[i]);
                cell.appendChild(content);
                row.appendChild(cell);
                break;
            }
        }
        table.appendChild(row);
    }
}

let loadChart = (data)=>{
    
    let option = document.querySelector('select');
    d3.select("svg").remove();
    if(option.value === 'pie'){
    let colors = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

    let svg = d3.select(".visual").append("svg").attr("width",400).attr("height",210),
        radius = Math.min(d3.select("svg").attr("width"),d3.select("svg").attr("height"))/2,
        g = svg.append("g").attr("transform", "translate(" + d3.select("svg").attr("width")/2 + "," + d3.select("svg").attr("height")/2 +")");
    let pie = d3.pie();
    let arc = d3.arc().innerRadius(0).outerRadius(radius);
    let label = d3.arc().outerRadius(radius).innerRadius(radius-50);
    let arcs = g.selectAll("arc").data(pie(data.percentage)).enter().append("g").attr("class","arc")
    console.log(arcs)
    arcs.append("path").attr("fill",(d,i)=>(colors(i))).attr("d",arc);
    arcs.append("text").attr("transform",(d)=>("translate("+ label.centroid(d)+")")).text((d)=>((numeral(d.data).format('0.00'))));
    console.log(pie(data.percentage));
    }
    else if(option.value === 'bar'){
        console.log(Object.keys(data.words));
        let color = "#4daf4a";
        let barHeight = 30,
        margin =1;
        let myTool = d3.select('.visual')
                   .append('div')
                   .attr('class','tooltip')
                   .attr("opacity","0")
                   .attr("display","none")
        d3.select("svg").remove();
        let svg = d3.select(".visual")
                    .append("svg")
                    .attr("width", 400)
                    .attr("height",barHeight*data.percentage.length)
    let scale = d3.scaleLinear()
                .domain([d3.min(data.percentage),d3.max(data.percentage)])
                .range([5,1000]);
    
    
    let bar = svg.selectAll("g").data(data.percentage).enter().append("g").attr("transform",(d,i)=>(
        "translate(0," + i * barHeight +")"
    ));
    
    bar.append("rect").attr("width",(d)=>{
        return(scale(d))
    }).attr("height",barHeight-margin).attr("style",`fill:${color}`).on("mouseover",(d,i)=>{
        myTool.transition().duration(500).style("opacity","1").style("display","block")
        myTool.html(
            `<div id='name'>${Object.keys(data.words)[i]}</div>`
        )
    }).on("mouseout",(d,i)=>{
        myTool.transition().duration(500).style("opacity","0").style("display","none")
    });
    bar.append("text").attr("x",(d)=>(d*(barHeight+10))).attr("y",barHeight/2).attr("dy",".35em").text((d)=>((numeral(d).format('0.00'))));
    }
}
let handleChange = ()=>{
    loadChart(data);
}
showStats(data)
loadChart(data);