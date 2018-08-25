/**
 * 
 * auth:callor@callor.com
 * @since 2018-08-26
 * @rem pagination 구현을 위한 예제
 * 로또번호 엑셀파일을 mongoDB에 업로드 하고 페이지네이션으로 보여주기
 * 
 */
// multer 초기화 작업
var multer = require('multer')
var path = require('path')
var fs = require('fs')
var mongoExcel = require('mongo-xlsx')
var mongojs = require('mongojs')
var db = mongojs('master')

// 페이지네이션을 처리하기 위한 middleware
// https://github.com/expressjs/express-paginate
var paginate = require('express-paginate');
paginate.middleware(10, 50)

// 업로드한 파일을 저장할 곳
var filePath = path.join(__dirname, '../public/excel')

// multer가 파일을 받아서 저장할 환경setting
var saveStorage = multer.diskStorage({
	
    // 폴더설정
    // 폴더 설정을 String으로 하면 자동으로 폴더를 생성한다.
    destination : filePath, // (req,file,callback)=>{
    				// callback(null,filePath)},
    // 파일이름 변경
    filename : (req,file,callback)=>{
	callback(null,Date.now() + '_' + file.originalname)
    }
})

// 업로드 함수 생성
var upload = multer({storage:saveStorage}).single('excel')

module.exports = (app,lotto)=>{

    // paginate.middleware(limit, maxLimit)
    app.use(paginate.middleware(10, 50));
    
    // 모든 요청에 대하여 앞단 처리
    app.all(function(req, res, next) {
        // 기본 페이지 출력 개수를 10으로 세팅
        if (req.query.limit <= 10) req.query.limit = 10;
        next();
    });

    app.get('/',(req,res)=>{
	res.redirect('list')
    })
    
    app.get('/file',(req,res)=>{
	res.render('index',{body:'file'})
    })
    
    app.post('/excel',(req,res)=>{
	db.lottos.remove({})
	upload(req,res,async (err)=>{
            if(req.file != undefined) {
                let fileName = path.join(filePath,req.file.filename)
                let model = null
                mongoExcel.xlsx2MongoData(fileName,model,(err,data)=>{
                    model = mongoExcel.buildDynamicModel(data)
                    console.log(model)
                    db.lottos.insert(data,(err,doc)=>{
                        res.redirect('/')
                    })
                })
            }
	})
    })
    
    app.get('/list',(req,res)=>{
	
	lotto.countDocuments((err,itemCount)=>{
	        lotto.find()
            	.limit(req.query.limit)
            	.skip(req.skip)
            	.sort({'회차':-1}) // DESC -1, ASC 1
            	.exec((err,results)=>{
            	    
                    let pageCount = Math.ceil(itemCount / req.query.limit);
            	    res.render('index', {
                    	body:'lotto',
                	lotto: results,
                	
                	// view단에서 사용할 페이지 관련된 값들
                	pageCount,
                	itemCount,
                	
                	// active page 세팅을 위하여 선택된 페이지 번호를 보낸다
                	currentPage:parseInt(req.query.page),
                	
                	// pagination을 구현하기 위한 배열 생성
                	// .getArrayPages(limit, pageCount, currentPage)
                	// 선택된 페이지를 중심으로 좌우로 limite 개수 만큼 페이지 번호 나열
                	pages: paginate.getArrayPages(req)(10, pageCount, req.query.page)
                    })
            	})

	})
    })
	
}