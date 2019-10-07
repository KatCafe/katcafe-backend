import SocketIo from 'socket.io';
import Router from "./../router"
import SessionController from "../DB/models/auth/sessions/session-controller";

export default function(app, server){

    Router(app);

    const serverSocket = SocketIo.listen(server);

    serverSocket.on('connection', function(socket){

        console.log('Socket Connected');

        socket.on('disconnect', ()=>{
            console.log('Socket Disconnected');
        });

        const ipAddress = socket.handshake.address;

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


