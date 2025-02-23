var Beibu_Gulf = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[108.03863371743522, 21.608674770428376],
          [108.00284902409305, 21.549522266929706],
          [108.04259449632949, 21.54720395801876],
          [108.06440053733765, 21.524049194547242],
          [108.12171711703503, 21.47646933658755],
          [108.66377509215829, 21.47836848250364],
          [108.9851223779623, 21.52692100089574],
          [109.03181383484089, 21.337730266972184],
          [109.5893651203562, 21.42468617922647],
          [109.73493269148673, 21.440025991591952],
          [109.59760484433835, 20.976570283257736],
          [109.70093578550251, 20.454643359745738],
          [109.84375691395965, 20.22286455990516],
          [109.86298286948316, 20.050093298712742],
          [109.59382002118379, 20.050093258908],
          [109.39332116635994, 19.972671197872007],
          [109.2038085406001, 19.94685539165488],
          [109.09394613090686, 19.789287691155796],
          [108.945878977919, 19.632754325728023],
          [108.90193399830461, 19.547364290425854],
          [109.06398103406868, 19.379039688647534],
          [109.33863708383443, 19.65862111367423],
          [109.73963484785692, 19.762046661480763],
          [110.0719685674345, 19.898728465651278],
          [110.18183093535016, 19.971024158140683],
          [110.14584582017267, 20.49034330801552],
          [109.93710721768535, 20.901433603289842],
          [110.01950386772295, 21.265335946685468],
          [110.21176285410709, 21.490403360195728],
          [110.16781785584126, 21.68450009741745],
          [109.83199743958401, 21.540555277650594],
          [109.77157314880985, 21.635049554513497],
          [109.71114885816122, 21.76009551357216],
          [109.64660474281125, 21.850622066423284],
          [109.36508260219642, 21.858269557007755],
          [109.14810456441263, 21.874837760175225],
          [108.90366095105281, 21.8684656355792],
          [108.73434462542153, 21.942259952145502],
          [108.58465725256058, 21.951176309928062],
          [108.23584441690828, 21.846693098384222],
          [108.10538286154004, 21.712791936082898]]]),
    mangrove_2021 = ee.Image("users/NO1/2022new_mangrove/1986_2021_landsat_sentinel2_mangrove_region"),
    Avicennia_marina = /* color: #0000ff */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([108.86769451011804, 21.629057433899888]),
            {
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([108.8676515947738, 21.626863265897367]),
            {
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([108.86679328788904, 21.624270115307173]),
            {
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([108.86567748893884, 21.623671689332827]),
            {
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([108.86520542015222, 21.62343231824934]),
            {
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([108.86404670585779, 21.62331263255894]),
            {
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([108.86336006034998, 21.623232842043617]),
            {
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([108.859583510057, 21.622833888806294]),
            {
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([108.85662235130457, 21.622235456885686]),
            {
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([108.85718025077966, 21.623512108654552]),
            {
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([108.85035671104578, 21.626105272845063]),
            {
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([108.85301746238855, 21.62742178454977]),
            {
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([108.8528458010116, 21.625985589368113]),
            {
              "system:index": "12"
            })]);

Map.centerObject(Avicennia_marina, 14);
// Avicennia marina samples are ground survey data, 
// please contact the corresponding author for detailed field survey data
// due to data privacy and relevant collaborating organizations.

//You can view phenological trajectories by using the inspector 
//on the right side of the GEE platform and clicking on the sample points.
Map.addLayer(Avicennia_marina,{color:'red'},'field_samples')

/***************function*********************/
var addfitted = function(image) {//fittedHarmonic includes bands['B1', 'B2','B3', 'B4','B5', 'B7', 'NDMI','costants','t','cos_1','cos_2','cos_3','sin_1','sin_2','sin_3','fitted']
  return image.addBands(
    image.select(independents)
      .multiply(harmonicTrendCoefficients)
      .reduce('sum')
      .rename('fitted'));
};

var addtrend_line = function(image) {
  return image.addBands(
    image.select(line_co)
      .multiply(harmonicTrendCoefficients.select(line_co))
      .reduce('sum')
      .rename('line_trend'))
      // .reproject(image.select(index).projection());
};

var addtrend_season = function(image) {
  return image.addBands(
    image.select(season_co)
      .multiply(harmonicTrendCoefficients.select(season_co))
      .reduce('sum')
      .rename('season_trend'))
      // .rename('fitted'));
      // .reproject(image.select(index).projection());
};

var addtrend_b_season = function(image) {
  return image.addBands(
    image.select(b_season_co)
      .multiply(harmonicTrendCoefficients.select(b_season_co))
      .reduce('sum')
      // .rename('season_trend'))
      .rename('fitted'));
      // .reproject(image.select(index).projection());
};

var addresiduals =function(image){
  return image.addBands(
    image.select(index)
    .subtract(image.select('line_trend'))
    .subtract(image.select('season_trend'))
    .rename('residuals'));
};

var addsquaredResiduals = function(image){
  return image.addBands(
    image.select('residuals')
    .pow(2)
    .rename('squaredResiduals'));
};

var fit_image_week = function(date){
  return function(i){
          var next_date = date.advance(ee.Number(i),'week');
          var years = next_date.difference('1970-01-01', 'year');
          var constant = ee.Image(1);
          var timeRadians = ee.Image(years.multiply(2 * Math.PI)).float().rename('t');
          var frequencies = ee.Image.constant(harmonicFrequencies);
          var cosines = timeRadians.multiply(frequencies).cos().rename(cosNames);
          var sines = timeRadians.multiply(frequencies).sin().rename(sinNames);
          return constant.addBands(timeRadians).addBands(cosines).addBands(sines).set('system:time_start', next_date.millis());
       };
};

var fit_image_month = function(date){
  return function(i){
          var next_date = date.advance(ee.Number(i),'month');
          var years = next_date.difference('1970-01-01', 'year');
          var constant = ee.Image(1);
          var timeRadians = ee.Image(years.multiply(2 * Math.PI)).float().rename('t');
          var frequencies = ee.Image.constant(harmonicFrequencies);
          var cosines = timeRadians.multiply(frequencies).cos().rename(cosNames);
          var sines = timeRadians.multiply(frequencies).sin().rename(sinNames);
          return constant.addBands(timeRadians).addBands(cosines).addBands(sines).set('system:time_start', next_date.millis());
       };
};

//year_float
var t_band_year = function(image){
  var t_year = image.select('t').divide(2 * Math.PI).add(1970).float().rename('t_year');
  return image.addBands(t_year);
};

var constructBandNames = function(base, list) {
  return ee.List(list).map(function(i) {
    return ee.String(base).cat(ee.Number(i).int());
  });
};

var addDependents = function(image) {
  // Compute time in fractional years since the epoch.
  var years = image.date().difference('1970-01-01', 'year');
  var timeRadians = ee.Image(years.multiply(2 * Math.PI)).rename('t');
  var constant = ee.Image(1);
  return image.addBands(constant).addBands(timeRadians.float());
};


var addHarmonics = function(freqs) {
  return function(image) {
    var frequencies = ee.Image.constant(freqs);
    var time = ee.Image(image).select('t');
    var cosines = time.multiply(frequencies).cos().rename(cosNames);
    var sines = time.multiply(frequencies).sin().rename(sinNames);
    return image.addBands(cosines).addBands(sines);
  };
};

//NDVI
var ndviTransform = function(img){ 
  var ndvi = img.normalizedDifference(['B4', 'B3'])
                .select([0], ['NDVI']) 
                .float()
                .set('system:time_start', img.get('system:time_start'));
  return img.addBands(ndvi);
};

//GDVI
var gdviTransform = function(img) {
    var gdvi = img.select('B4').subtract(img.select('B2'))                                       
                  .select([0], ['GDVI'])
                  .float()
                  .set('system:time_start', img.get('system:time_start')); 
    return img.addBands(gdvi) ;
};

//LAI 
var laiTransform = function(img) {
  var evi = eviTransform(img).select('EVI');
  var lai = evi.multiply(3.618).subtract(0.118)
               .select([0], ['LAI'])
               .float()
               .set('system:time_start', img.get('system:time_start'));
  return img.addBands(lai);
};

//EVI
var eviTransform = function(img) {
var evi = img.expression(
  "(2.5*(NIR-Red))/(NIR+6*Red-7.5*BLUE+1)",
  {
    "NIR": img.select("B4"),
    "Red": img.select("B3"),
    "BLUE":img.select("B1")
  }).select([0], ['EVI']) 
    .float()
    .set('system:time_start', img.get('system:time_start'));
  return img.addBands(evi);
};

//NDMIw
var ndmiwTransform = function(img){ 
  var ndmiw = img.normalizedDifference(['B4', 'B5'])
                .select([0], ['NDMIw']) 
                .float()
                .set('system:time_start', img.get('system:time_start'));
  return img.addBands(ndmiw);
};

//MASK  NDVI>0.2
var mask02NDVI = function(image){
  var ndvi_mask = ndviTransform(image).select('NDVI').gte(0.2);
  return image.updateMask(ndvi_mask); 
};

//constructing intre-annual time series
var inter_annual_index = function(imagecollection, other_imagecollection, sensor_type, index,scale){
  function  projectimg(img){
    return img.reproject('EPSG:32649',null,scale);
  }
  var landsat_col = imagecollection;
  var sentinel_col = other_imagecollection;
  var comp_imagecollection;
  
  if(sensor_type == 'landsat'){
    comp_imagecollection = landsat_col;}
  if(sensor_type == 'sentinel2'){
    comp_imagecollection = sentinel_col;
  }
  if(sensor_type == 'landsat+sentinel2'){
     var ls_sentinel_col = landsat_col;
     var s2_sentinel_col = sentinel_col;
     comp_imagecollection = ls_tc.merge(s2_tc);
  }
  var indexImgcol;
    switch (index){
      case 'B1':
        indexImgcol = comp_imagecollection.select(['B1']).map(projectimg);
        break;
      case 'B2':
        indexImgcol = comp_imagecollection.select(['B2']).map(projectimg);
        break;
      case 'B3':
        indexImgcol = comp_imagecollection.select(['B3']).map(projectimg);
        break;
      case 'B4':
        indexImgcol = comp_imagecollection.select(['B4']).map(projectimg);
        break;
      case 'B5':
        indexImgcol = comp_imagecollection.select(['B5']).map(projectimg);
        break;
      case 'B7':
        indexImgcol = comp_imagecollection.select(['B7']).map(projectimg);
        break;
      case 'NDVI':
        indexImgcol = comp_imagecollection.map(ndviTransform).map(projectimg);
        break;
      case 'EVI':
        indexImgcol = comp_imagecollection.map(eviTransform).map(projectimg);
        break;        
      case 'NDMIw':
        indexImgcol = comp_imagecollection.map(ndmiwTransform).map(projectimg);
        break;
      case 'GDVI':
        indexImgcol = comp_imagecollection.map(gdviTransform).map(projectimg);
        break;
      case 'LAI':
        indexImgcol = comp_imagecollection.map(laiTransform).map(projectimg);
        break;
        
      default:
        print('The index you provided is not supported');
    }
      return indexImgcol;
};

// slope and intercept citation: Roy, D.P., Kovalskyy, V., Zhang, H.K., Vermote, E.F., Yan, L., Kumar, S.S, Egorov, A., 2016, Characterization of Landsat-7 to Landsat-8 reflective wavelength and normalized difference vegetation index continuity, Remote Sensing of Environment, 185, 57-70.(http://dx.doi.org/10.1016/j.rse.2015.12.024); Table 2 - reduced major axis (RMA) regression coefficients
var harmonizationRoy = function(oli) {
  var slopes = ee.Image.constant([0.9785, 0.9542, 0.9825, 1.0073, 1.0171, 0.9949]); 
  var itcp = ee.Image.constant([-0.0095, -0.0016, -0.0022, -0.0021, -0.0030, 0.0029]); 
  var y = oli.select(['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']) 
             .subtract(itcp).divide(slopes) 
             .copyProperties(oli,oli.propertyNames()); 
  return y;//.float(); 
};

//removing cloud
var Landsat_remove_cloud_SR = function(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(4).eq(0).and( // Cirrus           4 = 1<<2
             qa.bitwiseAnd(8).eq(0).and( // Cloud            8 = 1<<3
             qa.bitwiseAnd(16).eq(0)).and( // Cloud Shadow   16 = 1<<4
             qa.bitwiseAnd(32).eq(0))); // Snow              32 = 1<<5
  return image.updateMask(mask);
}; 

var Sentinel2_remove_cloud = function(image) { 
  var qa = image.select('QA60'); 
  var cloudBitMask = 1 << 10; 
  var cirrusBitMask = 1 << 11; 
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0) 
              .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask);
};

//scale and offset
var Scale_image_LS_SR = function(image){
  var scale_image = image.multiply(0.0000275).add(-0.2).float();
  return scale_image.copyProperties(image, image.propertyNames());
};

var Scale_image_LS_B = function(image){
  var scale_image = image.multiply(0.0001).float();
  return scale_image.copyProperties(image, image.propertyNames());
};


/********************paramates********************************/
var sensor = 'landsat';//'landsat' or'sentinel2'
var roi = Beibu_Gulf; //If memory exceeded, please use a smaller study area or import to a google drive.
var roio = roi;
var harmonics = 3;
var index_List = ['NDVI','GDVI','TCA','LAI','NDMIw'];
var point_col_name =['Avicennia_marina'];
var point_col = ee.FeatureCollection([Avicennia_marina]).toList(10);
var start_i = 0;
var end_i = 1;
var star_date_space = ee.Date('2021-01-01');
var star_date_time = ee.Date('2020-01-01');
var star_date_time_2012 = ee.Date('2012-01-01');


if(sensor == 'landsat'){
  var historyStart = '2012-01-01';
  var monitoringEnd = '2021-12-31';
  var scale = 30;
}
if(sensor == 'sentinel2'){
  var historyStart = '2019-01-01';
  var monitoringEnd = '2022-12-31';
  var scale = 10;
}

var time_number = 120;
var number_name = [];
for(var number=0;number<time_number;number++){
  var number_text = number.toString();
  if(number<10) number_text = '00'+number_text;
  if(number>10&&number<100) number_text = '0'+number_text;
  number_name.push(number_text);
}

/******************imagecol**************************/
var landsat5Collection = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2');
var landsat7Collection = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2');
var landsat8Collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2');
var Sentinel2Collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED");

var landsat5Collection1 = landsat5Collection
  .filterBounds(roi)
  .filterDate(historyStart, monitoringEnd)
  .map(Landsat_remove_cloud_SR)
  .map(Scale_image_LS_SR)
  .select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']);
  
var landsat7Collection1 = landsat7Collection
  .filterBounds(roi)
  .filterDate(historyStart, monitoringEnd)
  .map(Landsat_remove_cloud_SR)
  .map(Scale_image_LS_SR)
  .select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']);
  
var landsat8Collection1 = landsat8Collection
  .filterBounds(roi)
  .filterDate(historyStart, monitoringEnd)
  .map(Landsat_remove_cloud_SR)
  .map(Scale_image_LS_SR)
  .map(harmonizationRoy);

var sentinel2Collection = Sentinel2Collection
                     .filterBounds(roi)
                     .filterDate(historyStart, monitoringEnd)
                     .map(Sentinel2_remove_cloud)
                     .map(Scale_image_LS_B)
                     .select(['B2','B3','B4','B8','B11','B12'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']);

var Landsat_merge = ee.ImageCollection(landsat5Collection1.merge(landsat7Collection1).merge(landsat8Collection1)).sort('system:time_start');

Landsat_merge = Landsat_merge.map(mask02NDVI);
var sentinel2_merge = sentinel2Collection.map(mask02NDVI);

/**************************loop***************************/
// for(var hh = 0;hh<5;hh++){
  var index = 'NDVI';//index_List[hh];
  var dependent = index;
  var harmonicFrequencies = ee.List.sequence(1, harmonics); 
  var cosNames = constructBandNames('cos_', harmonicFrequencies);
  var sinNames = constructBandNames('sin_', harmonicFrequencies);
  var line_co=ee.List(['constant','t']);
  var season_co=ee.List(cosNames).cat(sinNames);
  var independents = line_co.cat(season_co); //[['constant','cos_1','cos_2',...'sin_1','sin_2',...]
  var b_season_co = ee.List(['constant']).cat(season_co);
  var use_col = inter_annual_index(Landsat_merge, sentinel2_merge, sensor, index);
  var histCollection = use_col;
  var harmonicLandsat = histCollection//harmonicLandsat includes bands['B1', 'B2','B3', 'B4','B5', 'B7', 'NDMI','costants','t','cos_1','cos_2','cos_3','sin_1','sin_2','sin_3']
    .map(addDependents)//171
    .map(addHarmonics(harmonicFrequencies));//188
  var harmonicTrend = harmonicLandsat//harmonicTrend includes bands['coefficients'(3*1),'residuals']
    .select(independents.add(dependent))//select[constant,cos_1,sin_1,NDMI].independents=[constant,cos_1,sin_1],dependent=[NDMI]
    .reduce(ee.Reducer.linearRegression(independents.length(), 1));//NDMI=k1*constant+k2*cos_1+k3*sin_1+residuals
  var harmonicTrendCoefficients = harmonicTrend.select('coefficients')//3*1
    .arrayProject([0])
    .arrayFlatten([independents]);//independents=['constant','cos_1','sin_1']
  var fittedHarmonic = harmonicLandsat.map(addfitted);
  print('fittedHarmonic',fittedHarmonic.first());
  var List_4 = ee.List.sequence(1, time_number, 1);
  var imagecol_relation_month = List_4.map(fit_image_month(star_date_time_2012));
  imagecol_relation_month = ee.ImageCollection(imagecol_relation_month);
  var fittedHarmonic_2012_all_month = imagecol_relation_month.map(addfitted);
  Map.addLayer(fittedHarmonic_2012_all_month.map(t_band_year).select('fitted'/*,'t_year'*/),null,'fittedHarmonic_2012_all_'+index);
  
  /*************Batch export of phenological trajectories of mangrove species samples****************/
  for(var region_i= start_i ;region_i<end_i;region_i++){
    // var region_i = 0;
    var dataset_time = fittedHarmonic_2012_all_month.map(t_band_year).select(['t_year'],['time']).toBands().float();
    var region_col = ee.FeatureCollection(point_col.get(region_i));

    var dataset = fittedHarmonic_2012_all_month.select(['fitted'],[index]).toBands().select(['.*'],number_name);
    var pixelValues = dataset.sampleRegions({
    			    collection: region_col,
    			    scale: scale, 
    });
    print(pixelValues);
    Export.table.toDrive({ 
    			    collection: pixelValues,
    			    description: sensor+'_'+index+'_'+point_col_name[region_i],
    			    folder: "BFAST_to_hants_time_series2020_2021_month_sentinal2",
    			    fileFormat: "CSV"
    });

  }
// }