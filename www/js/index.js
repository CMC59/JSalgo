var h=function(){R.fillStyle=I,R.fillRect(0,0,_,$)},Z=function(A,H,T,B,F){const N=A*T,Q=H*T;if(F)R.fillStyle=F,R.fillRect(N+1,Q+1,T-2,T-2);R.strokeStyle=B,R.strokeRect(N,Q,T,T)},D=function(A,H,T){Z(A,H,q*3,V,T);for(let B=0;B<3;B++)for(let F=0;F<3;F++)Z(A*3+F,H*3+B,q,J)},f=function(A,H){if(U[H][A]!==null){R.font="bold 60px Arial",R.textBaseline="middle",R.textAlign="center";const T=A*q+Math.floor(q*0.5),B=H*q+Math.floor(q*0.575);R.fillText(U[H][A].toString(),T,B)}else{R.fillStyle="#000",R.font="16px Arial",R.textBaseline="top",R.textAlign="start";const T=X[H][A],B=Math.max(q-2,Math.floor(q*0.8)),F=Math.floor(B/3),N=Math.max(1,Math.floor(q*0.1)),Q=A*q+N,E=H*q+N;for(let M=1;M<=9;M++){const Y=T.includes(M)?M:null,G=(M-1)%3,L=Math.floor((M-1)/3),P=Q+F*G,b=E+F*L;R.fillText(Y!==null?Y.toString():"",P,b)}}},m=function(){for(let A=0;A<9;A++)for(let H=0;H<9;H++)f(H,A)},y=function(){h();for(let A=0;A<3;A++)for(let H=0;H<3;H++)D(H,A)},W=new WebSocket(`ws://${location.host}`);W.onopen=()=>setInterval(()=>W.send("ping"),5000);W.onmessage=(A)=>{if(A.data!=="Well received")console.log(A.data);if(A.data==="reload")location.reload()};var I="#DDD",J="#AAA",V="#000",O=document.getElementById("sudokuCanvas"),R=O.getContext("2d"),_=O.width,$=O.height,q=Math.round(Math.min(_,$)/9),X=[],U=[];for(let A=0;A<9;A++){X.push([]),U.push([]);for(let H=0;H<9;H++)X[A].push([1,2,3,4,5,6,7,8,9]),U[A].push(null)}y();m();var K=null;O.addEventListener("mousemove",(A)=>{A.stopPropagation();const{offsetX:H,offsetY:T}=A,B=Math.min(Math.floor(H/q),8),F=Math.min(Math.floor(T/q),8);if(K===null||K[0]!==B||K[1]!==F)K=[B,F],console.log("Celulle s\xE9lectionn\xE9e:",K)});O.addEventListener("mouseout",(A)=>{A.stopPropagation(),K=null,console.log("Celulle s\xE9lectionn\xE9e:",K)});console.log("Frontend charg\xE9");
