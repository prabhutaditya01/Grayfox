let username;
let socket=io()
    do{
        username=prompt("Enter Your Name");
    }
    while(!username)

    let textarea=document.querySelector("#area");
    let submitbutton=document.querySelector("#comment_button");
    let commentbox=document.querySelector("#comment_box");
    
    submitbutton.addEventListener("click",  (e)=>{
       let comment=textarea.value;
        e.preventDefault();
        if(!comment){
            return
        }
       postcomment(comment);      
    })
    
     

    function postcomment(comment){

        let data={
            username:username,
            comment:comment
            }
           appendToDom(data)
           textarea.value="";
           //broadcasting the comment in real time
           broadcastcomment(data);
           //sync with mongodb
           syncwithdb(data);

       }
         function appendToDom(data){

        let lTag=document.createElement("li")
        lTag.classList.add("comment")
         let markup=`
        <div id="comment_card">
               <div id="username"><b>${data.username}</b></div>
               <p id="comment_content">${data.comment}</p>
               <div id="time"><img src="clock.png"/> <small>${moment(data.time).format("LT")}</small>
            </div>`
             lTag.innerHTML=markup
             commentbox.prepend(lTag)
           
       }
      function broadcastcomment(data){
        //use socket.io for realtime 
        socket.emit("comment",data);
        
      }
      socket.on("comment",(data)=>{
        appendToDom(data)
      })

      let timerid=null;
      function debounce(func,timer){

if(timerid){
clearTimeout(timerid);
}

      timerid= setTimeout(()=>{
        func()
       },timer)
      }
      
let typingDiv=document.querySelector(".typing")
socket.on("typing",(data)=>{
    typingDiv.innerText=`${data.username} is typing...`
    debounce(function(){

        typingDiv.innerText="";
    },700)
})

      //eventlistner on textarea
      textarea.addEventListener("keyup",(e)=>{
        socket.emit("typing",{username})
      })

      function syncwithdb(data){
const headers={
  "content-Type":"application/json"
}

        fetch("/api/comments",{method:"Post",body:JSON.stringify(data),headers})
        .then(response=>response.json())
        .then(result=>{
          console.log(result)
        })
      }

      //fecth karenge previous comments ko joh store ho gya hai

      function fetchComments(){
        fetch("/api/comments")
        .then(res=>res.json())
        .then(result=>{
          result.forEach((comment)=>{
            comment.time=comment.createdAt
            appendToDom(comment)
          })
          console.log(result)
        })
      }

      window.onload=fetchComments