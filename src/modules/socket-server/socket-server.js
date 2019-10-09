import SocketIo from 'socket.io';
import Router from "./../router"
import SessionController from "../DB/models/auth/sessions/session-controller";

export default function(app, server){

    Router(app);

    const serverSocket = SocketIo.listen(server);

    serverSocket.on('connection', function(socket){

        const ipAddress = socket.request.connection.remoteAddress;

        try{

            const ipAddress2 = socket.client.request.headers['cf-connecting-ip']
            console.log("ipAddress2", ipAddress2);

        }catch(err){

        }

        socket.on('disconnect', ()=>{
            console.log('Socket Disconnected', ipAddress);
        });

        console.log('Socket Connected', ipAddress);

        const callRoute = (route, callback)=> {

            socket.on(route, async (data, send) => {

                    data.auth = null;
                    try{
                        const out = await SessionController.loginModelSession( data.headers.session );
                        data.auth = out.user;
                    }catch(err){
                        data.authError = err;
                    }

                    data.ipAddress = ipAddress;

                    callback(data, {
                        json: a => send(a),
                        status: status => ({json: a=> send({error: a})  })
                    });

                }
            );
        };

        const socketSubscribe = {

            get: callRoute,
            post: callRoute,

        };

        Router(socketSubscribe);

    });


}


