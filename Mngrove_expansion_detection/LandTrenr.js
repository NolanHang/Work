var beihai_rigion = 
    /* color: #00ffff */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[108.99122143694129, 21.617667936639286],
          [108.99122143694129, 21.56531385989073],
          [109.12700558611121, 21.56531385989073],
          [109.12700558611121, 21.617667936639286]]], null, false),
    Beibu_Gulf = 
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
    mangrove_2019 = ee.FeatureCollection("users/NO1/Mangrove_production/mangrove_of_China_for_2019"),
    mangrove_2021 = ee.Image("users/NO1/2022new_mangrove/1986_2021_landsat_sentinel2_mangrove_region");


Map.centerObject(beihai_rigion, 14);
var roi = beihai_rigion;
var distDir = -1;
var startYear = 1990; 
var endYear = 2024; 
var startDay = '-01-01'; 
var endDay =   '-12-31';
var ifwater = 1;
var ifsentinl2= false;
var value_selectList = ['max','min','mean','median'];
var step2012 = false;
// define the segmentation parameters - see paper (NEED CITATION)
mangrove_2019 = mangrove_2019.map(function(PL){return PL.buffer(100)});
var run_params = {
  maxSegments:            6,
  spikeThreshold:         0.5,
  vertexCountOvershoot:   6,
  preventOneYearRecovery: true,
  recoveryThreshold:      0.25,
  pvalThreshold:          0.05,
  bestModelProportion:    0.75,
  minObservationsNeeded:  6
};

// define disturbance mapping filter parameters 
var treeLoss1  = -1500;      // delta filter for 1 year duration disturbance, <= will not be included as disturbance - units are in units of segIndex defined in the following function definition
var treeLoss20 = -750;      // delta filter for 20 year duration disturbance, <= will not be included as disturbance - units are in units of segIndex defined in the following function definition
var preVal     = -55000;      // pre-disturbance value threshold - values below the provided threshold will exclude disturbance for those pixels - units are in units of segIndex defined in the following function definition
var mmu        = 6;       // minimum mapping unit for disturbance patches - units of pixels

// assemble the disturbance extraction parameters
var distParams = 
  {
    tree_loss1: treeLoss1,
    tree_loss20: treeLoss20,  
    pre_val: preVal           
  };

/*****************************************************************************/
/*************************Strat***********************************************/
/*****************************************************************************/

var index_list = ['NDVI','EVI','GDVI','NDMIw'];
                                
var number_index =index_list.length;
for(var j = 0;j<number_index;j++){
  var index_put = index_list[j];
  var type_put = 'max';//value_select = type_put
  var index_max_Collection_gian = makeLtStack(startYear, endYear, startDay, endDay, roi, ifwater, ifsentinl2, index_put, type_put);
  // Map.addLayer(index_max_Collection_gian,{min: 0,max: 1,palette: ["9400d3","4b0082","0000ff","00ff00","ffff00","ff7f00","ff0000"]}, 'index_max_Collection_gian');    // add disturbance year of detection to map
  run_params.timeSeries = index_max_Collection_gian; 
  var index_max_Collection_gian_lt = ee.Algorithms.TemporalSegmentation.LandTrendr(run_params); 
  var viz = {min: 1986,max: 2021,palette: ["9400d3","4b0082","0000ff","00ff00","ffff00","ff7f00","ff0000"]};
  var max_distImg_gain = extractDisturbance(index_max_Collection_gian_lt.select('LandTrendr'), distDir, -1, distParams).updateMask(mangrove_2021);
  Map.addLayer(max_distImg_gain.select(['yod']), viz, index_put+'_'+'max_expand_year');    // add disturbance year of detection to map
}  


/*********************************/
/**********function tool********/
/*********************************/

/*******************************************************/
// one year image composite--Landsat
function getSRcollection(year, startDay, endDay, sensor, box, ifwater) {
  var srCollection = ee.ImageCollection('LANDSAT/'+ sensor + '/C02/T1_L2') 
                       .filterBounds(box) 
                         .filterDate(year+startDay, year+endDay)//.filterDate(ee.Date(year), ee.Date(year).advance(1,'year'))
                       .map(Landsat_remove_cloud_SR)
                       .map(Scale_image_LS_SR)
                       .map(function(img){return img.float()});
  var srCollection_1;
  if(sensor == 'LT05'){
      srCollection_1 = srCollection.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']);
  }  
  if(sensor == 'LE07'){
      srCollection_1 = srCollection.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']);
      // srCollection_1 = srCollection_1.map(function(image){
      // var filled1a = image.focal_mean(2, 'square', 'pixels', 1);
      // return image.blend(filled1a.blend(image)).float();});
  }     
  if(sensor == 'LC08'){
      srCollection_1 = srCollection.map(harmonizationRoy);
  } 
  if(sensor == 'LC09'){
      srCollection_1 = srCollection.map(harmonizationRoy);
  }     
  return srCollection_1; 
}

//one year image composite--sentinel-2
function getSRcollection_s2(year, startDay, endDay, box) {
  var srCollection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') 
                       .filterBounds(box) 
                      .filterDate(ee.Date(year), ee.Date(year).advance(1,'year'))
  var sentinel_cloud_po = ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY")
                            .filterBounds(box)
                            .filterDate(ee.Date(year), ee.Date(year).advance(1,'year'))
  var sr_remove_cloud = Sentinel2_remove_cloud2(srCollection, sentinel_cloud_po)
                      .map(Scale_image_LS_B) 
                      .map(resample_s2);
  return srCollection.select(['B2','B3','B4','B8','B11','B12'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']); 
}

// MAKE AN LT STACK
function makeLtStack(startYear, endYear, startDay, endDay, roi, ifwater, ifsentinl2, index, value_select){
  var Stack;
  var imgs = [];
  for(var k = startYear ; k<=endYear ;k++ ){
    var year_collection= getCombinedSRcollection(k, startDay, endDay, roi, ifwater, ifsentinl2);
    var flip_index = one_year_index(year_collection, k, index, value_select, true);
    var ftv_index = one_year_index(year_collection, k, index, value_select, false).select([index],['ftv_'+index.toLowerCase()]);
    Stack = flip_index.addBands(ftv_index).set('system:time_start', (new Date(k,8,1)).valueOf());
    imgs = imgs.concat(Stack.set('system:time_start', (new Date(k,8,1)).valueOf()));
  }
  return ee.ImageCollection(imgs);
}

//sentinel-2 resample 30m
function resample_s2(image){
  var targetProjection = ee.Projection('EPSG:32649').atScale(30);
  var resampledImage = image.resample('bilinear').reproject({
    crs: targetProjection,
    scale: 30
  });
  return resampledImage;
}

//merge one year all images
function getCombinedSRcollection(year, startDay, endDay, box, ifwater, ifsentinl2) {
    var lt5 = getSRcollection(year, startDay, endDay, 'LT05', box, ifwater); 
    var le7 = getSRcollection(year, startDay, endDay, 'LE07', box, ifwater);  
    var lc8 = getSRcollection(year, startDay, endDay, 'LC08', box, ifwater); 
    var lc9 = getSRcollection(year, startDay, endDay, 'LC09', box, ifwater); 
    if(ifsentinl2){
      var se2  = getSRcollection_s2(year, startDay, endDay, box);
      return  ee.ImageCollection(lt5.merge(le7).merge(lc8).merge(lc9)).merge(se2); 
    }
    else
      return  ee.ImageCollection(lt5.merge(le7).merge(lc8).merge(lc9));
}

function one_year_index(imagecollection, year, index, value_select, index_flip){
  var band_short = function(image){
  return image.short();
  };
  var indexImgcol;
    switch (index){
      case 'B1':
        indexImgcol = imagecollection.select(['B1']).map(band_short);
        break;
      case 'B2':
        indexImgcol = imagecollection.select(['B2']).map(band_short);
        break;
      case 'B3':
        indexImgcol = imagecollection.select(['B3']).map(band_short);
        break;
      case 'B4':
        indexImgcol = imagecollection.select(['B4']).map(band_short);
        break;
      case 'B5':
        indexImgcol = imagecollection.select(['B5']).map(band_short);
        break;
      case 'B7':
        indexImgcol = imagecollection.select(['B7']).map(band_short);
        break;
      case 'NDVI':
        indexImgcol = imagecollection.map(ndviTransform);
        break;
      case 'EVI':
        indexImgcol = imagecollection.map(eviTransform);
        break;        
      case 'NDMIw':
        indexImgcol = imagecollection.map(ndmiwTransform);
        break;
      case 'LAI':
        indexImgcol = imagecollection.map(laiTransform);
        break;
      case 'GDVI':
        indexImgcol = imagecollection.map(gdviTransform);
        break;
      default:
        print('The index you provided is not supported');
    }
    var indexImg;
    indexImgcol = indexImgcol.select(index);
  switch (value_select){
     case 'max':
          indexImg = indexImgcol.max();
          break;
     case 'min':
          indexImg = indexImgcol.min();
          break;
     case 'median':
          indexImg = indexImgcol.median();
          break;
     case 'mean':
          indexImg = indexImgcol.mean();
          break;
      default:
       indexImg = indexImgcol;
       return indexImg;
  }
   if(index_flip)
      return indexImg.multiply(-1).set('system:time_start', (new Date(year,8,1)).valueOf());
    else
      return indexImg.set('system:time_start', (new Date(year,8,1)).valueOf());
}

// Landsat_remove_cloud 
function Landsat_remove_cloud_SR(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(4).eq(0).and( // Cirrus           4 = 1<<2
             qa.bitwiseAnd(8).eq(0).and( // Cloud            8 = 1<<3
             qa.bitwiseAnd(16).eq(0)).and( // Cloud Shadow   16 = 1<<4
             qa.bitwiseAnd(32).eq(0))); // Snow              32 = 1<<5
  return image.updateMask(mask);
}

//Sentinel2_remove_cloud1 
var Sentinel2_remove_cloud1 = function(image) { 
  var qa = image.select('QA60'); 
  var cloudBitMask = 1 << 10; 
  var cirrusBitMask = 1 << 11; 
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0) 
              .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask);
};

//Sentinel2_remove_cloud2 
function Sentinel2_remove_cloud2(sentinel_sr, sentinel_cloud_po){
  var rmCloudByProbability = function(image, thread) { 
    var prob = image.select("probability"); 
    return image.updateMask(prob.lte(thread)); 
  } ;
  
  var getMergeImages = function(primary, secondary) { 
    var join = ee.Join.inner(); 
    var filter = ee.Filter.equals({ 
      leftField: 'system:index', 
      rightField: 'system:index' 
    }); 
    var joinCol = join.apply(primary, secondary, filter); 
    joinCol = joinCol.map(function(image) { 
      var img1 = ee.Image(image.get("primary")); 
      var img2 = ee.Image(image.get("secondary")); 
      return img1.addBands(img2); 
    }); 
    return ee.ImageCollection(joinCol); 
  }; 
  var s2Imgs = getMergeImages(sentinel_sr, sentinel_cloud_po); 
  var s2Imgs_final = s2Imgs.map(function(image) { 
    return rmCloudByProbability(image, 90); 
  }); 
  return s2Imgs_final;
}

// multiply Scale and offset 
function Scale_image_LS_SR(image){
  var scale_image = image.multiply(0.0000275).add(-0.2).float();
  return scale_image.copyProperties(image, image.propertyNames());
}//LS

function Scale_image_LS_B(image){
  var scale_image = image.multiply(0.0001).float();
  return scale_image.copyProperties(image, image.propertyNames());
}//S2

// slope and intercept citation: Roy, D.P., Kovalskyy, V., Zhang, H.K., Vermote, E.F., Yan, L., Kumar, S.S, Egorov, A., 2016, Characterization of Landsat-7 to Landsat-8 reflective wavelength and normalized difference vegetation index continuity, Remote Sensing of Environment, 185, 57-70.(http://dx.doi.org/10.1016/j.rse.2015.12.024); Table 2 - reduced major axis (RMA) regression coefficients
function harmonizationRoy(oli) {
  var slopes = ee.Image.constant([0.9785, 0.9542, 0.9825, 1.0073, 1.0171, 0.9949]); 
  var itcp = ee.Image.constant([-0.0095, -0.0016, -0.0022, -0.0021, -0.0030, 0.0029]); 
  var y = oli.select(['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']) 
             .subtract(itcp).divide(slopes) 
             .copyProperties(oli,oli.propertyNames()); 
  return y;//.float(); 
}

// harmonize tm and etm+ to oli
function harmonizationRoy2OLI(tm) {
  var slopes = ee.Image.constant([0.9785, 0.9542, 0.9825, 1.0073, 1.0171, 0.9949]);        
  var itcp = ee.Image.constant([-0.0095, -0.0016, -0.0022, -0.0021, -0.0030, 0.0029]);    
  var y = tm.select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7'])    
             //.resample('bicubic')                                                
             .multiply(slopes).add(itcp)                      
             .copyProperties(tm,tm.propertyNames());                
  return y;//.float(); 
}

/***************************************************************************************/
/****************************vegetation index*******************************************/
/***************************************************************************************/
//NDMI--CWC
function ndmiwTransform(img){ 
  var ndmiw = img.normalizedDifference(['B4', 'B5'])
                .select([0], ['NDMIw']) 
                .float()
                .set('system:time_start', img.get('system:time_start'));
  return img.addBands(ndmiw);
}

//NDVI---CCC
function ndviTransform(img){ 
  var ndvi = img.normalizedDifference(['B4', 'B3'])
                .select([0], ['NDVI']) 
                .float()
                .set('system:time_start', img.get('system:time_start'));
  return img.addBands(ndvi);
}

//EVI--computing LAI
function eviTransform(img) {
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
}

//LAI 
var laiTransform = function(img) {
  var evi = eviTransform(img).select('EVI');
  var lai = evi.multiply(3.618).subtract(0.118)
               .select([0], ['LAI'])
               .float()
               .set('system:time_start', img.get('system:time_start'));
  return img.addBands(lai);
};

//GDVI--NR
function gdviTransform(img) {
    var gdvi = img.select('B4').subtract(img.select('B2'))                                       
                  .select([0], ['GDVI'])
                  .float()
                  .set('system:time_start', img.get('system:time_start')); 
    return img.addBands(gdvi) ;
}

function extractDisturbance(lt, distDir, sort, params, mmu){
    var vertexMask = lt.arraySlice(0, 3, 4); 
    var vertices = lt.arrayMask(vertexMask); 
    var left = vertices.arraySlice(1, 0, -1);   
    var right = vertices.arraySlice(1, 1, null);
    var startYear = left.arraySlice(0, 0, 1);    
    var startVal = left.arraySlice(0, 2, 3);     
    var endYear = right.arraySlice(0, 0, 1);     
    var endVal = right.arraySlice(0, 2, 3);      
    var dur = endYear.subtract(startYear);       
    var mag = endVal.subtract(startVal);        
    if(sort == -1)
      var new_mag = mag.multiply(-1);
    else
      var new_mag = mag;
    var distImg = ee.Image.cat([startYear.add(1), new_mag, dur, startVal.multiply(distDir)]).toArray(0); 
    var distImgSorted = distImg.arraySort(new_mag.multiply(-1));                              
    var tempDistImg = distImgSorted.arraySlice(1, 0, 1).unmask(ee.Image(ee.Array([[0],[0],[0],[0]])));            
    var finalDistImg = ee.Image.cat(tempDistImg.arraySlice(0,0,1).arrayProject([1]).arrayFlatten([['yod']]),     
                                    tempDistImg.arraySlice(0,1,2).arrayProject([1]).arrayFlatten([['mag']]),    
                                    tempDistImg.arraySlice(0,2,3).arrayProject([1]).arrayFlatten([['dur']]),    
                                    tempDistImg.arraySlice(0,3,4).arrayProject([1]).arrayFlatten([['preval']])); 
    // filter out disturbances based on user settings
    var threshold = ee.Image(finalDistImg.select(['dur']))                       
                      .multiply((params.tree_loss20 - params.tree_loss1) / 19.0)  
                      .add(params.tree_loss1)                                    
                      .lte(finalDistImg.select(['mag']))                          
                      // .and(finalDistImg.select(['mag']).gt(200))              
    finalDistImg = finalDistImg.mask(threshold).int16(); 
    return finalDistImg; // return the filtered greatest disturbance attribute image
  };