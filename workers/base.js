Base = { 
        onMessage: function(event){
                        this.init();
                        var method = event.data.method;

                                
                        if (method in this)
                        {
                            this[method](event.data.args)
                        }
                    }
};