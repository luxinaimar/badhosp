 $(document).ready(function () {
        var time1 = 0;
        var show = false;
        var names = new Array(); //文章名字等
        var urls = new Array(); //文章地址
        var domHospList = $('.hospital-list');
        var domSearch = $('.search');
        searchList.data.forEach(function(item){
            names.push(item.title);
            urls.push(item.url);
        });
        function getRandomArrayElements(arr, count) {
            var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
            while (i-- > min) {
                index = Math.floor((i + 1) * Math.random());
                temp = shuffled[index];
                shuffled[index] = shuffled[i];
                shuffled[i] = temp;
            }
            return shuffled.slice(min);
        }
        var showName = getRandomArrayElements(names, 20);
        var showContent = '';
        showName.forEach(function(item){
            showContent += '<article class="post">' +
                        '<img src="./static/hospital.png">'+   
                        item+
                        '</article>';
        });
        domHospList.html(showContent);
        $('.bad-add').click(function(e){
            e.preventDefault();
            var searVal = domSearch.val();
            console.log(searVal);
            if(!searVal){
                alert('请您先搜索医院');
                return;
            }
            domMask.show();
            domPopLayer.show();
        });
        $(document).keyup(function (e) {
            var time2 = new Date().getTime();
            if (e.keyCode == 17) {
                var gap = time2 - time1;
                time1 = time2;
                if (gap < 500) {
                    if (show) {
                        $(".search-tool").css("display", "none");
                        show = false;
                    } else {
                        $(".search-tool").css("display", "block");
                        show = true;
                        $("#search-content").val("");
                        $("#search-content").focus();
                    }
                    time1 = 0;
                }
			}else if(e.keyCode == 27){
                    $(".search-tool").css("display", "none");
                    show = false;
                    time1 = 0;
                }
        });

 		$("#search-content").keyup(function (e) {
            var time2 = new Date().getTime();
            if (window.event.keyCode == 17) {
                var gap = time2 - time1;
                time1 = time2;
                if (gap < 500) {
                    if (show) {
                        $(".search-tool").css("display", "none");
                        show = false;
                    } else {
                        $(".search-tool").css("display", "block");
                        show = true;
                        $("#search-content").val("");
                        $("#search-content").focus();
                    }
                    time1 = 0;
                }
            }
        });

        $("#close-btn").click(function () {
            $(".search-tool").css("display", "none");
            show = false;
            time1 = 0;
        });

        $("#search-btn").click(function(){
            $(".search-tool").css("display", "block");
            show = true;
            $("#search-content").val("");
            $("#search-content").focus();
            time1 = 0;
        });
        $("#search-content").typeahead({
            source: names,
            afterSelect: function (item) {
                $(".search-tool").css("display", "none");
                show = false;
                getData(item);
                return item;
            }
        });
        var domMask = $('.mask'),
            domPopLayer = $('.pop-layer');

        domMask.click(function(e){
            e.preventDefault();
            domMask.hide();
            domPopLayer.hide();
       });

        //调用职能合约
        var dappAddress = "n1g258uU3ox4JGZNeoSEuQhSn1GKkRBnKLs";
        //var dappAddress = "n1nTjvKrKBmrY5ezKM8MgNvfF5ZUHQY8txW";
        var nebulas = require("nebulas"),
            Account = nebulas.Account,
            neb = new nebulas.Neb();
        neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
        //neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));


        getData('北京京北医院 - 其他');
        
        function getData(name){
            var from = Account.NewAccount().getAddressString();
            var value = "0";
            var nonce = "0"
            var gas_price = "1000000"
            var gas_limit = "2000000"
            var callFunction = "get";
            var callArgs = "[\"" + name + "\"]"; //in the form of ["args"]
            var contract = {
                "function": callFunction,
                "args": callArgs
            }

            neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
                searchRes(resp)
            }).catch(function (err) {
                //cbSearch(err)
                console.log("error:" + err.message)
            })
        }

        function searchRes(resp){
            var messages = JSON.parse(resp.result);
            //获取相关元素
            var domDappList = $(".app-list");
            var content="";
            var len = messages.length;
            if(len==0){
                content = '此医院暂无人添加劣迹'
            }
            for(var i=0;i<len;i++){
                content += '<article class="post">' +
                            '<header>'+
                                '<h1>'+
                                    '<a rel="bookmark">'+
                                        messages[i].name+
                                    '</a>'+
                                '</h1>'+
                            '</header>'+
                            '<div class="content-reset">'+
                                '<p>'+messages[i].content+'</p>'+
                            '</div>'+
                            '<div class="meta">'+
                                '<span class="tooltipped tooltipped-n" aria-label="创建日期">'+
                                    '<time>'+
                                        messages[i].time+
                                    '</time>'+
                                '</span>'+
                                '&nbsp; | &nbsp;'+
                                '<span class="tooltipped tooltipped-n" aria-label="作者">'+
                                         '来自  '+ messages[i].author+
                                '</span>'+
                                // &nbsp; | &nbsp;
                                // <span class="tooltipped tooltipped-n" aria-label="浏览数">
                                //     <i class="icon-views"></i>
                                //     992 浏览
                                // </span>
                            '</div>' +
                        '</article>';
            }
            domDappList.html(content);
        }
        var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
        var nebPay = new NebPay();
        var serialNumber
         $(".save-btn").click(function() {
            var to = dappAddress;
            var value = "0";
            var callFunction = "save";
            // var date = new Date().toDateString();
            var name = domSearch.val();
            var desc = $(".form-desc").val();
            var callArgs = "[\"" + name + "\",\"" + desc + "\"]";

            serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
                listener: cbPush        //设置listener, 处理交易返回信息
            });
            window.location.href=window.location.href;
        });

        function cbPush(resp) {
            console.log("response of push: " + JSON.stringify(resp))
        }
});
