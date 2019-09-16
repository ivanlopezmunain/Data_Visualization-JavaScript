
//Ivan Lopez de Munain Quintana

//pais por defecto
var pais ="Morocco";
//tamaño de los puntos
var radio = 2;
//valores para aplicar interacciones (visibilidad)
var lineaVisib = "1";
var restoLineasVisib = "0.1";
var puntoVisib = "1";
var restopuntosVisib = "0";

//Formatos y tamaños
var margin = {top: 80, right: 20, bottom: 40, left: 60},
w = 650 - margin.left - margin.right,
h = 450 - margin.top - margin.bottom;
var width = w + margin.left + margin.right
var height = h + margin.top + margin.bottom

//Elementos del primer grafico
var svg = d3.select("body").append("svg")
    .attr("width",width)
    .attr("height",height )
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

//Ejes del primer grafico
var x = d3.scaleLinear().range([0,w])
var y = d3.scaleLinear().range([h, 0]);
var xAxis = d3.axisBottom(x).ticks(25,"d");
var yAxis = d3.axisLeft(y).ticks(5);

//rejillas para el primer grafico
var yGrid = d3.axisLeft(y)
    .ticks(5) 
    .tickSize(-w, 0, 0)
    .tickFormat("");

var xGrid = d3.axisBottom(x)
    .ticks(25)
    .tickSize(h, 0, 0)
    .tickFormat("");

//rectas del primer grafico (intervalo inferior - media - intervalo superior)
var lineMedian = d3.line()
    .x(function(d) { return x(d.Anio); })
    .y(function(d) {  return y(d.muertesMedian); });
var lineLower = d3.line()
    .x(function(d) { return x(d.Anio); })
    .y(function(d) { return y(d.muertesLower); }); 
var lineUpper = d3.line()
    .x(function(d) { return x(d.Anio); })
    .y(function(d) { return y(d.muertesUpper); }); 
var valueline = d3.line()
    .x(2011)
    .y(function(d) { return y(d.muertesLower); });

//creacion de un div dentro del body para añadir una ventana con los valores de las abscisas y ordenadas del punto señalado
//inicialmente no visible (opacity igual a 0)
var div = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

//encontrar los radio buttom de la pagina
var button = document.querySelectorAll('input[type=radio][name="pais"]');

//para cada radio button solo activamos aquel cuyo identificador sea igual al pais seleccionado (al empezar es el pais por defecto)
button.forEach(function(d){
    if(d.id==pais){
        d.checked = true;
    }
});

//Para leer los datos
d3.csv("mortalidadInfantilTransformado.csv", function(error, data) {

    //convertimos algunas variables a numericas
    data.forEach(function(d) {
        d.Anio = +d.Anio;
        d.muertesLower = +d.muertesLower;
        d.muertesMedian = +d.muertesMedian;
        d.muertesUpper = +d.muertesUpper;
    });
    
    //creamos el grafico para el pais por defecto
    var dataset=data;
    dataset = dataset.filter(function(d){
        return d.CountryName==pais;
        });
    dibujar_bandas(dataset);

    //registramos manejadores de eventos para los radio buttoms
    if(error) throw error;
    button.forEach(function(d){
        d.addEventListener('change',cambiarPais);
    });

    //funcion que recoge el evento de cambio de pais y realiza el nuevo grafico
    function cambiarPais(event) {
        pais = this.value;
        dataset = filter_data(); 
        svg.selectAll("g").remove();
        svg.selectAll("circle").remove();
        svg.selectAll("path").remove();
        dibujar_bandas(dataset);
    }

    //funcion que filtra los datos segun el pais que ha sido seleccionado
    function filter_data(){
        var dataset= data.filter(function(d){
            return d.CountryName==pais;
            });
        return dataset;
    }



})

//funcion que elabora el grafico en su totalidad
function dibujar_bandas(data){

    //dominio de las x y de las y
    x.domain([1990,2014]);
    y.domain([
       (d3.min(data, function(d) { 
               return d.muertesLower; 
       })-300),
       d3.max(data, function(d) {
               return d.muertesUpper; 
       })+500]);
    

    //rejilla para las y
    svg.append("g")
        .attr("class", "grid")
        .style("stroke-width", 0.2)
        .call(yGrid);

    //rejilla  para las x
    svg.append("g")
        .attr("class", "grid")
        .style("stroke-width", 0.2)
        .call(xGrid);

    //introduccion de la recta que representa la mediana y sus interacciones y tansiciones
    svg.append("path")
       .attr("class", "line")
       .style("stroke", "red")
       .attr("d", lineMedian(data))
       .call(transition)
       .on("mouseover",function(){
           svg.append("text")
               .attr("class","title-text")
               .style("fill", "red")
               .style("font-family", "cursive")
               .text("Media")
               .attr("x",20)
               .attr("y",200);
           d3.selectAll('.line')
               .style('opacity',restoLineasVisib);
           d3.selectAll('.circle')
               .style('opacity', restopuntosVisib);
           d3.select(this)
               .style('opacity', lineaVisib)
       })
       .on("mouseout",function(){
           svg.select(".title-text").remove();
           d3.selectAll(".line")
               .style('opacity', lineaVisib);
           d3.selectAll('.circle')
               .style('opacity', puntoVisib);
       });

    //introduccion de la recta que representa el intervalo inferior y sus interacciones y tansiciones
    svg.append("path")
       .attr("class", "line")
       .style("stroke", "black")
       .attr("d", lineLower(data))
       .call(transition)
       .on("mouseover",function(){
           svg.append("text")
               .attr("class","title-text")
               .style("fill", "black")
               .style("font-family", "cursive")
               .text("I.C. Inferior")
               .attr("x",20)
               .attr("y",200);
       })
       .on("mouseout",function(){
           svg.select(".title-text").remove();
       });

    //introduccion de la recta que representa el intervalo superior y sus interacciones y tansiciones
    svg.append("path")
       .attr("class", "line")
       .style("stroke", "black")
       .attr("d", lineUpper(data))
       .call(transition)
       .on("mouseover",function(){
           svg.append("text")
               .attr("class","title-text")
               .style("fill", "black")
               .style("font-family", "cursive")
               .text("I.C. Superior")
               .attr("x",20)
               .attr("y",200);
       })
       .on("mouseout",function(){
           svg.select(".title-text").remove();
       });

    //funcion para realizar la transicion a la hora de crear las rectas
    function transition(path) {
        path.transition()
        .duration(2000)
        .attrTween("stroke-dasharray",interpolacion);
    }

    //funcion que va interpolando la recta
    function interpolacion() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) { return i(t); };
    }
     
    //introduccion de los puntos y sus interacciones y tansiciones
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", radio-1.5)
        .attr("cx", function(d) {
                    return x(d.Anio); })
        .attr("cy", function(d) { 
                return y(d.muertesMedian); })
        .style("fill","red")
        .style("opacity",puntoVisib)
        .on("mouseover",handleMouseOverPuntos) 
        .on("mouseout",handleMouseOutPuntos)
        .transition()
        .delay(500)
        .duration(5300)
        .attr("r",radio);

    //Colocamos los primeros ejes
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + h + ")")
        .call(xAxis);
    d3.select('.x')
        .selectAll('text')
        .attr("dx", "-.20em")
        .attr("dy", ".15em")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    //titulo
    var title = svg.append("g")
        .attr("class", "title");
    title.append("text")
        .attr("x", (w / 2))
        .attr("y", -30 )
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .style("font-family","helvetica")
        .text("Mortalidad infantil");

    //labels
    var labels = svg.append("g").attr("class", "labels");
    labels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -56)
        .attr("dy", ".81em")
        .attr("x",-5)
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .text("Nº muertes");
}



//funcion para gestionar la interaccion relativa a los puntos
function handleMouseOverPuntos(d,pos) {

    //cambiar el tamaño del punto
    d3.select(this).attr("r",2*radio);

    //notificar el valor de las abcisas y ordenadas
    //decir en que recta nos encontramos y ocultar el resto
    svg.append("text")
      .attr("class","title-text")
      .style("fill", "red")
      .style("font-family", "cursive")
      .text("Media")
      .attr("x",20)
      .attr("y",200);   
    d3.selectAll('.line')
      .style('opacity',restoLineasVisib);
    d3.selectAll('.circle')
      .style('opacity', restopuntosVisib);

    //construccion del div
    div.transition().style('opacity', .9);
    div.html('Año:' + d.Anio + '<br/>' + 'Muertes:' + d.muertesMedian).style('left', (d3.event.pageX) + 'px')
      .style('top', (d3.event.pageY) + 'px');
    if(d.Anio==2011 && pais=="Japan"){
        div.transition().style('opacity', .9);
        div.html('Año:' + d.Anio + '<br/>' + 'Muertes:' + d.muertesMedian + '<br/>'+ 'Tsunami').style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY) + 'px');
    }
  }

  //funcion para gestionar la interaccion relativa a los puntos
  function handleMouseOutPuntos(d,pos) {

    //vuelta al estado anterior a la interaccion
    d3.select(this).attr("r",radio);
    svg.select(".title-text").remove();
    d3.selectAll(".line")
        .style('opacity', lineaVisib);
    d3.selectAll('.circle')
        .style('opacity', puntoVisib);
    div.transition().style('opacity', 0);
  }

//============================================================================

//Segundo grafico

var svg2 = d3.select("body").append("svg")
.attr("width",width)
.attr("height",height )
.append("g")
.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

//Ejes del segundo grafico
var x2 = d3.scaleLinear().range([0,w])
var y2 = d3.scaleLinear().range([h, 0]);
var xAxis2 = d3.axisBottom(x2).ticks(25,"d");
var yAxis2 = d3.axisLeft(y2).ticks(5);

//rejillas del segundo grafico
var yGrid2 = d3.axisLeft(y2)
    .ticks(5)
    .tickSize(-w, 0, 0)
    .tickFormat("");
var xGrid2 = d3.axisBottom(x2)
    .ticks(25)
    .tickSize(h, 0, 0)
    .tickFormat("");

//creacion de un div dentro del body para añadir una ventana con los valores de las abscisas y ordenadas del punto señalado
//inicialmente no visible (opacity igual a 0)
var div2 = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

//creacion del area         
var areaPIB = d3.area()
    .x(function(d) {return x2(d.Year); })
    .y0(y2(0))
    .y1(function(d) {return y2(d.GDP)  });

//creacion del area con altura cero para hacer la transiccion
var areaPIBComienzo = d3.area()
    .x(function(d) {return x2(d.Year); })
    .y0(0)
    .y1(function(d) {return y2(0)  });  

//leer los datos
d3.csv("PIBTransformado.csv", function(error, data) {

    //conversion de los datos a numericos
    data.forEach(function(d) {
        d.Year = +d.Year;
        d.GDP= +d.GDP
        });
    
    //elaboracion del stacked area chart con el pais por defecto
    var dataset=data;
    dataset = dataset.filter(function(d){
        return d.Entity==pais;
        });
    dibujar_PIB(dataset);

    //registramos manejadores de eventos para los radio buttoms
    if(error) throw error;
    button.forEach(function(d){
        d.addEventListener('change',cambiarPais);
    });

    //funcion que recoge el evento de cambio de pais y realiza el nuevo grafico
    function cambiarPais(event) {
        pais = this.value;
        dataset = filter_data(); 
        svg2.selectAll("g").remove();
        svg2.selectAll("circle").remove();
        svg2.selectAll("path").remove();
        dibujar_PIB(dataset);
    }

    //funcion que filtra los datos segun el pais seleccionado
    function filter_data(){
        var dataset= data.filter(function(d){
            return d.Entity==pais;
            });
        return dataset;
    }
    })

    //funcion que elabora el grafico totalmente
    function dibujar_PIB(data){
        //Mapear los dominios con los datos
        x2.domain([1990,2014]);
        y2.domain([
            (d3.min(data, function(d) {
                return d.GDP; })-1000), 
            d3.max(data, function(d) {
                    return d.GDP; })+1000]);
            

        //incluir el area, sus interacciones y transiciones
        svg2.append("path")
            .attr("class", "area")
            .attr("d",areaPIBComienzo(data))
            .transition()
            .duration(2000)
            .attr("d",areaPIB(data));

        //incluir los puntos, sus interacciones y transiciones
        svg2.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", 0)
            .attr("cx", function(d) {
                    return x2(d.Year); })
            .attr("cy", function(d) { 
                    return y2(d.GDP); })
            .style("fill","rgb(14, 184, 8)")
            .style("opacity",puntoVisib)
            .on("mouseover",handleMouseOverPuntosPIB) 
            .on("mouseout",handleMouseOutPuntosPIB)
            .transition()
            .delay(500)
            .duration(5300)
            .attr("r",radio);


        //Colocamos los segundos ejes
        svg2.append("g")
            .attr("class", "x2 axis")
            .attr("transform", "translate(0, " + h + ")")
            .call(xAxis2);
            d3.select('.x2').selectAll('text').attr("dx", "-.20em").attr("dy", ".15em")
            .style("text-anchor", "end").attr("transform", "rotate(-65)");
        
            svg2.append("g")
            .attr("class", "y2 axis")
            .call(yAxis2);
 


        //titulo del grafico
        var title = svg2.append("g")
            .attr("class", "title");
        title.append("text")
            .attr("x", (w / 2))
            .attr("y", -30 )
            .attr("text-anchor", "middle")
            .style("font-size", "22px")
            .style("font-family","helvetica")
            .text("Crecimiento económico");

        //etiquetas
        var labels = svg2.append("g").attr("class", "labels");
        labels.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -56).attr("dy", ".81em")
            .attr("x",-5).style("text-anchor", "end")
            .style("font-size", "10px")
            .text("PIB ($)");
    }

    //funcion para gestionar la interaccion relativa a los puntos
    function handleMouseOverPuntosPIB(d) {

        //formato a la hora de mostrar el PIB (solo un decimal)
        var f = d3.format(".1f");
        //cambiar el radio de los puntos
        d3.select(this).attr("r",2*radio).style("fill","black");
        //hacer visible el tooltipy mostrar las coordenadas
        div2.transition().style('opacity', .9);
        div2.html('Año:' + d.Year + '<br/>' + 'PIB:' + f(d.GDP)).style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY) + 'px');
        //incluir rejilla vertical
        svg2.append("g")
          .attr("class", "grid")
          .style("stroke-width", 0.2)
          .call(xGrid2);
        
      }

      //funcion para gestionar la interaccion relativa a los puntos
      function handleMouseOutPuntosPIB(d) {

        //puntos vuelven al tamaño normal y ocultamos el tooltip
        d3.select(this).attr("r",radio).style("fill","rgb(14, 184, 8)");
        div2.transition().style('opacity', 0);

        //borrar la rejilla pero mantener el resto de elementos de svg2 ("g")
        svg2.selectAll("g").remove();
        svg2.append("g")
            .attr("class", "x2 axis")
            .attr("transform", "translate(0, " + h + ")")
            .call(xAxis2);
        d3.select('.x2')
            .selectAll('text')
            .attr("dx", "-.20em")
            .attr("dy", ".15em")
            .style("text-anchor", "end").attr("transform", "rotate(-65)");
        svg2.append("g")
            .attr("class", "y2 axis")
            .call(yAxis2);
        //labels
        var labels = svg2.append("g").attr("class", "labels");
        labels.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -56).attr("dy", ".81em")
            .attr("x",-5).style("text-anchor", "end")
            .style("font-size", "10px")
            .text("PIB ($)");
        //titulo
        var title = svg2.append("g")
            .attr("class", "title");
        title.append("text")
            .attr("x", (w / 2))
            .attr("y", -30 )
            .attr("text-anchor", "middle")
            .style("font-size", "22px")
            .text("Crecimiento económico");
      }

