Base = { 
        onMessage: function(event){
                        //throw JSON.stringify(this);
                        //throw 'madeit';
                        this.init();

                        var method = event.data.method;
                                
                        if (method in this)
                        {
                            this[method](event.data.args)
                        }
                    }
};

a = 1;