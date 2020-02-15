//section 1
//APIを利用する際のURLになります
var KEY = 'AIzaSyBZFhyOJVTadxTxjDtZeajEOKyZgQjOQAo'
var url = 'https://vision.googleapis.com/v1/images:annotate?key='
var api_url = url + KEY

//section 2
//ページを読み込む際に動的にラベル検出結果表示用のテーブルを作成
$(function(){
    for (var i =0; i < 10; i++){
        $("#resultBox").append("<tr><td class='resultTableContent'></td></tr>")
    }
})

//section 3
//画面の表示内容をクリアする処理
function clear(){
    if($("#textBox tr").length){
        $("#textBox tr").remove();
    }
    if($("#chartArea div").length){
        $("#chartArea div").remove();
    }
    $("#resultBox tr td").text("")
}

//section 4
//画像がアップロードされた時点で呼び出される処理
$("#uploader").change(function(evt){
    getImageInfo(evt);
    clear();
    $(".resultArea").removeClass("hidden")
})

//section 5
//画像ファイルを読み込み、APIを利用するためのURLを組み立てる
function getImageInfo(evt){
    var file = evt.target.files;
    var reader = new FileReader();
    var dataUrl = "";
    reader.readAsDataURL(file[0]);
    reader.onload = function(){
        dataUrl = reader.result;
        $("#showPic").html("<img src='" + dataUrl + "'>");
        makeRequest(dataUrl,getAPIInfo);
    }
}

//section 6
//APIへのリクエストに組み込むJsonの組み立て
function makeRequest(dataUrl,callback){
    var end = dataUrl.indexOf(",")
    var request = "{'requests': [{'image': {'content': '" + dataUrl.slice(end + 1) + "'},'features': [{'type':'TEXT_DETECTION'}]}]}"
    callback(request)
}

//section 7
//通信を行う
function getAPIInfo(request){
    $.ajax({
        url : api_url,
        type : 'POST',       
        async : true,        
        cashe : false,
        data: request, 
        dataType : 'json', 
        contentType: 'application/json',   
    }).done(function(result){
        showResult(result);
    }).fail(function(result){
        alert('failed to load the info');
    });  
}

//section 8
//得られた結果を画面に表示する
function showResult(result){

    //テキスト解読の結果を表示
    if(result.responses[0].textAnnotations){
        for (var j = 1; j < result.responses[0].textAnnotations.length; j++){
            if(j < 61){
                const word = result.responses[0].textAnnotations[j].description
                $("#textBox").append(`<tr><td class='resultTableContent'>${word}</td><td><input type='checkbox' class='resultcheckbox' name='savecheckbox' value='${word}' checked></td></tr>`)
            }
        }
    }else{
        //テキストに関する結果が得られなかった場合、表示欄にはその旨を記す文字列を表示
        $("#textBox").append("<tr><td class='resultTableContent'><b>No text can be found in the picture</b></td></tr>")
    }
    $(".savebutton").removeClass("hidden")
}

const db = firebase.firestore()
const collection = db.collection("words")
const submitButton = document.getElementById("submit")
const textarea = document.getElementById("content-area")
const words = document.getElementById("words")

function filterdData() {
    const data = []
    const trList = document.querySelectorAll('table tbody tr')
    trList.forEach(tr => {
        //console.log(tr);
        const checkbox = tr.querySelector("input[type='checkbox']")
        //console.log(checkbox);
        if (checkbox.checked) {
            data.push(checkbox.value)
        }
    })
    return data
}

//const button = document.getElementById('submit')

/*button.addEventListener('click', () => {
    const data = filterdData()
    console.log(data)
})*/ 

submitButton.addEventListener("click", () => {
    const wordsgroup = filterdData()
    wordsgroup.forEach(everyword =>{
    const data = {
      en:everyword,
      ja:"",
      created_at: Date.now()
    }
    if (data.en) {
      collection.add(data)
        .then(res => {
            console.log(res)
        })
        .catch((error) => {
          console.error("Error adding document: ", error)
        })
    }
  })

})
