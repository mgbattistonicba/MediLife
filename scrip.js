
$("#loader").css("display", "block");
		
var idenc = "2", 
ident = "0310WX344109SJ59";

var arrayPreguntas = [],
arrayRespuestas = [];

if (idenc != "null" && ident != "null") {
    $.ajax({
        'url': '../EncuestaPreguntaOnline',
        'method': 'GET',
        'data': {
            'idenc': idenc,
            'ident': ident
        },
        'headers': {
            'Content-Type': 'application/json'
        }
    }).done(function (response) {
        $("#loader").css("display", "none");
        
        for (i in response) {
            
            if (response[i].completado == "TRUE") {
                $('.modal').on('show.bs.modal', function (event) {
                    var modal = $(this)
                    modal.find('.content-body').html("Usted ya completo esta Encuesta. Gracias por su cooperación.");
                    modal.find('.btn-aceptar').css("display", "inline");
                    modal.find('.btn-close').css("display", "none");
                });

                $('.modal').modal('show');

                break;
            }
            

            arrayPreguntas.push([response[i].id, response[i].pregunta, response[i].tipo, response[i].valorRspSMS]);
        }

        if (typeof arrayPreguntas !== 'undefined' && arrayPreguntas.length > 0) {
            $("#panel_footer").css("display", "block");
            
            $('#pagination-container').pagination({
                dataSource: arrayPreguntas,
                callback: function(data, pagination) {
                    var html = templating(data, pagination);
                    $('#data-container').html(html);
                },
                beforeNextOnClick: function () {
                    return agregarRespuesta();
                },
                afterIsLastPage: function () {
                    $(".paginationjs-next").css("display", "none");
                    $("#btn_enviar").css("display", "block");
                },
                pageSize: 1,
                activeClassName: 'btn btn-primary',
                nextText: '<button class="btn btn-primary">Siguiente</button>',
                showPageNumbers: false,
                showPrevious: false
            })

            $("#btn_enviar").click(function () {
                if (agregarRespuesta()) {
                    $.ajax({
                        'url': '../EncuestaPreguntaOnline',
                        'method': 'POST',
                        'data': {
                            'idenc': idenc,
                            'ident': ident,
                            'respuestas': JSON.stringify(arrayRespuestas)
                        }
                    }).done(function (response) {
                        if (response == "error") {
                            alert("Ha ocurrido un error. Por favor vuelva a intentarlo mas tarde.");
                        } else {
                            $('.modal').on('show.bs.modal', function (event) {
                                var modal = $(this);
                                modal.find('.content-body').html("¡Gracias por ayudarnos a mejorar!");
                                modal.find('.btn-aceptar').css("display", "inline");
                                modal.find('.btn-close').css("display", "none");
                            });

                            $('.modal').modal('show');

                            $('#btn_enviar').prop('disable', true);
                            $('#btn_enviar').css('display', 'none');
                        }
                    });
                }
            });
        }
    });
}

function templating(data, pagination) {
    var datosPreg = data[0];
    var html = '<div class="col-xs-12 pregunta"><img src="../imagens/icons-communicate.png"><span>' + datosPreg[1] + '</div>';
    if (datosPreg[2] == 'ESCALA') {
        html += '<div class="col-xs-12">' + generarOpcionesHTML(datosPreg[3].split(','), datosPreg[0]) + '</div>';
    } else {
        html += '<div class="col-xs-12"><textarea class="form-control" rows="4" maxlength="500" name="enc_respuesta_' + datosPreg[0] + '" style="resize: vertical;"></textarea></div>';
    }
    return html;
}

function generarOpcionesHTML(opciones, idPreg) {
    var opc = '';
    opciones.forEach(function (value, index, array) {
        opc += '<input type="radio" name="enc_respuesta_'+ idPreg + '" value="' + value + '"> ' + value + '<br />';
    });
    return opc;
}

function agregarRespuesta() {
    var arrPreguntaActual = $('#pagination-container').pagination('getSelectedPageData')[0];
    
    if (arrPreguntaActual[2] == 'ESCALA') {
        if ($("input[name='enc_respuesta_" + arrPreguntaActual[0] + "']:checked").length < 1) {
            alert("Debe seleccionar una de las opciones para continuar.");
            return false;
        } else {
            arrayRespuestas.push({"idPreg": arrPreguntaActual[0], "respuesta": $("input[name='enc_respuesta_" + arrPreguntaActual[0] + "']:checked").val()});
            return true;
        }
    }

    if (!$("textarea[name='enc_respuesta_" + arrPreguntaActual[0] + "']").val().trim()) {
        alert("Debe completar el campo para continuar.");
        return false;
    } else {
        arrayRespuestas.push({"idPreg": arrPreguntaActual[0], "respuesta": $("textarea[name='enc_respuesta_" + arrPreguntaActual[0] + "']").val().trim()});
        return true;
    }
}
