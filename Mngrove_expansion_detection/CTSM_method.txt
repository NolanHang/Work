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
    DEM = ee.Image("NASA/NASADEM_HGT/001"),
    mangrove_2021 = ee.Image("users/NO1/2022new_mangrove/1986_2021_landsat_sentinel2_mangrove_region");


Map.centerObject(beihai_rigion, 12);
mangrove_2019 = mangrove_2019.map(function(PL){return PL.buffer(100)});
//mangrove_2019. Chuanpeng Zhao, Cheng-Zhi Qin. A fine resolution mangrove map of China for 2019 derived from 
//satellite observations and Google Earth images[DS/OL]. V2. Science Data Bank, 2021[2025-02-23]. 
//10-m-resolution https://cstr.cn/31253.11.sciencedb.00245. CSTR:31253.11.sciencedb.00245.

/**************function tool*******************/ 
//NDWI
var ndwiTransform = function(img){ 
  var ndwi = img.normalizedDifference(['B2', 'B4'])
                .select([0], ['NDWI'])
                .float()
                .set('system:time_start', img.get('system:time_start'));
  return ndwi;
};

//MVI
var mviTransform = function(img){ 
  var mvi = img.expression('abs(B4-B2)/abs(B5-B2)',{'B2':img.select('B2'),'B4':img.select('B4'),'B5':img.select('B5')})
                .select([0], ['MVI'])
                .float()
                .set('system:time_start', img.get('system:time_start'));
  // return mvi;
  return mvi;
};

// Landsat -- time series in one year
var getSRcollection = function(year, startDay, endDay, sensor, box, ifwater) {
  var srCollection = ee.ImageCollection('LANDSAT/'+ sensor + '/C02/T1_L2') 
                       .filterBounds(box) 
                       .filterDate(ee.Date(year), ee.Date(year).advance(1,'year'))
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
};

//sentinel-2
var getSRcollection_s2 = function(year, startDay, endDay, box) {
  var srCollection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') 
                       .filterBounds(box) 
                      // .filterDate(year+'-'+startDay, year+'-'+endDay); 
                      .filterDate(ee.Date(year), ee.Date(year).advance(1,'year'))
                      .map(Sentinel2_remove_cloud)
                      .map(Scale_image_LS_B); 
  return srCollection.select(['B2','B3','B4','B8','B11','B12'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']); 
};
var getCombinedSRcollection = function(year, startDay, endDay, box, ifwater, ifsentinl2) {
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
};

//remove cloud
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

// Scale and offset
var Scale_image_LS_SR = function(image){ //Landsat
  var scale_image = image.multiply(0.0000275).add(-0.2).float();
  return scale_image.copyProperties(image, image.propertyNames());
};
var Scale_image_LS_B = function(image){  //Sentinal 2
  var scale_image = image.multiply(0.0001).float();
  return scale_image.copyProperties(image, image.propertyNames());
};

// construction of inter-annual
var mvi_imagecol = function(year){
  var year_number = ee.Image(ee.Number.parse(year)).float();
  var imagecol = getCombinedSRcollection(year, startDay, endDay, roi, ifwater, ifsentinl2).map(mviTransform).median();
  var imagecol_change = imagecol.unmask(0);//.where(imagecol.eq(1),year_number);
  var year_band = year_number.int().select([0],['year']);  
  return imagecol_change.addBands(year_band);
};

var each_region = function(year){
  var year_number = ee.Image(ee.Number.parse(year)).float();
  var imagecol = getCombinedSRcollection(year, startDay, endDay, roi, ifwater, ifsentinl2).map(mviTransform).median().gt(shore);
  var imagecol_change = imagecol.where(imagecol.eq(1),year_number);
  return imagecol_change;
};

var each_region0 = function(year){
  var year_number = ee.Image(ee.Number.parse(year)).float();
  var imagecol = getCombinedSRcollection(year, startDay, endDay, roi, ifwater, ifsentinl2).map(mviTransform).median().gt(shore);
  var imagecol_change = imagecol.unmask(0).where(imagecol.eq(1),year_number);
  var year_band = year_number.int().select([0],['year']);
  return imagecol_change.addBands(year_band);
};

var each_region_none = function(year){
  var year_number = ee.Image(ee.Number.parse(year)).float();
  var imagecol = getCombinedSRcollection(year, startDay, endDay, roi, ifwater, ifsentinl2).map(mviTransform).median();
  var year_band = year_number.select([0],['year']);
  return imagecol.addBands(year_band).set('year', year).set('system:time_start',ee.Date(year).advance(6, 'month').millis());
};

var each_region_s2 = function(year){
  var year_number = ee.Image(ee.Number.parse(year)).float();
  var imagecol = getSRcollection_s2(year, startDay, endDay, roi).map(mviTransform).median().gt(shore_s2);
  var imagecol_change = imagecol.unmask(0).where(imagecol.eq(1),year_number);
  var year_band = year_number.int().select([0],['year']);
  return imagecol_change.addBands(year_band);
};

var harmonizationRoy = function(oli) {
  var slopes = ee.Image.constant([0.9785, 0.9542, 0.9825, 1.0073, 1.0171, 0.9949]); 
  var itcp = ee.Image.constant([-0.0095, -0.0016, -0.0022, -0.0021, -0.0030, 0.0029]); 
  var y = oli.select(['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']) 
             .subtract(itcp).divide(slopes) 
             .copyProperties(oli,oli.propertyNames()); 
  return y;//.float(); 
};


/****************Start************************/
var list = ee.List([/*'1986',*/'1987','1988','1989','1990','1991','1992','1993','1994','1995',
'1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008',
'2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024']);//Landsat--Time of existence of usable images
var list_s2 = ee.List(['2018','2019','2020','2021','2022','2023','2024']);//Sentienl 2--Time of existence of usable images
var length_year = list.length();
var length_year_s2 = list_s2.length();
var startDay = '01-01';
var endDay = '12-31';
var roi = beihai_rigion;//If memory exceeded, please use a smaller study area or import to a google drive.
var ifwater = 1;
var ifsentinl2 = 1;
var shore = 3; // MVI thresholds for identifying potential mangrove forests for Lansat images
var shore_s2 = 3; //MVI thresholds for identifying potential mangrove forests for Sentinel 2 images
var imagecol_list = [];

var hill = DEM.select('elevation').lt(8);
var imgcol_tem = ee.ImageCollection(list.map(each_region_none));
var imgcol = ee.ImageCollection(list.map(each_region));
var imgcol0 = ee.ImageCollection(list.map(each_region0));
var imgcol_mvi = ee.ImageCollection(list.map(mvi_imagecol)).toArrayPerBand(0);

/*******Detecting mangrove expansion before (2021-T) year***Landsat**/
var image_number = imgcol0.toArrayPerBand(0);
var image_number0 = image_number.select([0]);
var first = ee.Image(0).toArray(0).select([0],['MVI']);
var image_up = image_number0.arraySlice(0,1,length_year);
var image_down = image_number0.arraySlice(0,0,length_year.subtract(1));
var new_number_img = first.arrayCat(image_up.subtract(image_down),0);
var mask_year = new_number_img.eq(0).arrayPad([length_year.add(1)],1);
var image_number_add_2025 = image_number.select([1]).arrayPad([length_year.add(1)],2025);
var image_number1 = image_number_add_2025.arrayMask(mask_year);
var star_year = image_number1.arraySlice(0,0,-1);
var end_year = image_number1.arraySlice(0,1,null);
var duration = end_year.subtract(1).subtract(star_year).select([0],['duration']);
var duration_shore = ee.Image(5);// T thresholds
var year_4_mask = duration.gte(duration_shore.add(2));
var expand_year_conf = ee.Image.cat([duration,star_year.add(1)]).arrayMask(year_4_mask); 
var expand_year = expand_year_conf.select(['year']).arraySlice(0,0,1).arrayProject([0]).arrayFlatten([['year']])/*.updateMask(hill)*/;

/*******Detecting mangrove expansion after (2021-T) year*****/
var last_mask_year = mask_year.arraySlice(0,duration_shore.add(2).multiply(-1),null); 
var last_year = image_number_add_2025.arraySlice(0,duration_shore.add(2).multiply(-1),null);
var last_last_image_number1 = last_year.arrayMask(last_mask_year);
var last_star_year = last_last_image_number1.arraySlice(0,0,-1);
var last_end_year = last_last_image_number1.arraySlice(0,1,null);
var last_duration = last_end_year.subtract(1).subtract(last_star_year).select([0],['duration']);
var last_year_2_mask = last_duration.gte(2);
var last_expand_year_conf = ee.Image.cat([last_duration,last_star_year.add(1)]).arrayMask(last_year_2_mask); 
var last_expand_year = last_expand_year_conf.select(['year']).arraySlice(0,0,1).arrayProject([0]).arrayFlatten([['year']]).updateMask(hill);
var final_year_col = getCombinedSRcollection('2024', startDay, endDay, roi, ifwater, ifsentinl2);
var final_year_ndwi = final_year_col.map(ndwiTransform).median().lt(0);
var final_year = final_year_col.map(mviTransform).median().gt(shore).updateMask(final_year_ndwi);
var final_year1 = final_year.multiply(2024).select([0],['year']).updateMask(hill);
var expan_landsat = ee.ImageCollection.fromImages([expand_year.selfMask(),last_expand_year.selfMask(),final_year1.selfMask()]).min();

/*******Detecting mangrove expansion before (2021-T) year***Sentinel 2**/
var imgcol_s2 = ee.ImageCollection(list_s2.map(each_region_s2));
var image_number_s2 = imgcol_s2.toArrayPerBand(0);
var image_number0_s2 = image_number_s2.select([0]);
var first_s2 = ee.Image(0).toArray(0).select([0],['MVI']);
var image_up_s2 = image_number0_s2.arraySlice(0,1,length_year_s2);
var image_down_s2 = image_number0_s2.arraySlice(0,0,length_year_s2.subtract(1));
var new_number_img_s2 = first_s2.arrayCat(image_up_s2.subtract(image_down_s2),0);
var mask_year_s2 = new_number_img_s2.eq(0).arrayPad([length_year_s2.add(1)],1);
var image_number_add_2025_s2 = image_number_s2.select([1]).arrayPad([length_year_s2.add(1)],2025);
var image_number1_s2 = image_number_add_2025_s2.arrayMask(mask_year_s2);
var star_year_s2 = image_number1_s2.arraySlice(0,0,-1);
var end_year_s2 = image_number1_s2.arraySlice(0,1,null);
var duration_s2 = end_year_s2.subtract(1).subtract(star_year_s2).select([0],['duration']);
var year_2_mask_s2 = duration_s2.gte(3);
var expand_year_conf_s2 = ee.Image.cat([duration_s2,star_year_s2.add(1)]).arrayMask(year_2_mask_s2); 
var expand_year_s2 = expand_year_conf_s2.select(['year']).arraySlice(0,0,1).arrayProject([0]).arrayFlatten([['year']]).updateMask(hill);

/*******Detecting mangrove expansion after (2021-T) year***Sentinel 2**/
var final_year_s2 =  getSRcollection_s2('2024', startDay, endDay, roi).map(mviTransform).median().gt(shore_s2);
var final_year1_s2 = final_year_s2.multiply(2024).select([0],['year']).updateMask(hill);
var expan_sentinel2 = ee.ImageCollection.fromImages([expand_year_s2.selfMask(), final_year1_s2.selfMask()]).min();
// Map.addLayer(expan_sentinel2.selfMask(),{min:2018,max:2024,palette:["9400d3","0000ff","00ff00","ff0000"]},'expan_sentinel2', false);

var expan_combine = ee.ImageCollection.fromImages([expan_landsat.selfMask(), expan_sentinel2.selfMask().reproject('EPSG:4326',null,30)]).min();//'EPSG:4326'
var magrove_expand_year = expan_combine.updateMask(mangrove_2021);//.clip(mangrove_2019)
Map.addLayer(magrove_expand_year, {min:1986,max:2024,palette:["9400d3","4b0082","0000ff","00ff00","ffff00","ff7f00","ff0000"]},'magrove_expand_year');
