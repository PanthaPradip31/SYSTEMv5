import json

from django.forms.models import model_to_dict
from django.http import Http404, HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Admin, KillFeed, OverlayConfig, Player, Sponsor, Standing, Team, Tournament

MODEL_MAP = {
    'tournament': Tournament,
    'teams': Team,
    'players': Player,
    'standings': Standing,
    'kill_feed': KillFeed,
    'overlay_config': OverlayConfig,
    'sponsors': Sponsor,
    'admins': Admin,
}


def serialize_instance(instance):
    data = model_to_dict(instance)
    data['id'] = str(data.get('id', ''))
    return data


def get_model_or_404(model_name):
    model = MODEL_MAP.get(model_name)
    if model is None:
        raise Http404('Model not found')
    return model


def home(request: HttpRequest) -> HttpResponse:
    return JsonResponse({
        'detail': 'PUBG Live Production Django API',
        'endpoints': [
            '/api/tournament/',
            '/api/teams/',
            '/api/players/',
            '/api/standings/',
            '/api/kill_feed/',
            '/api/overlay_config/',
            '/api/sponsors/',
        ],
    })


@csrf_exempt
def api_list(request: HttpRequest, model_name: str) -> HttpResponse:
    model = get_model_or_404(model_name)

    if request.method == 'GET':
        items = model.objects.all()
        return JsonResponse([serialize_instance(item) for item in items], safe=False)

    if request.method == 'POST':
        payload = json.loads(request.body.decode('utf-8') or '{}')
        instance = model.objects.create(**payload)
        return JsonResponse(serialize_instance(instance), status=201)

    return JsonResponse({'detail': 'Method not allowed'}, status=405)


@csrf_exempt
def api_detail(request: HttpRequest, model_name: str, pk: str) -> HttpResponse:
    model = get_model_or_404(model_name)
    try:
        instance = model.objects.get(pk=pk)
    except model.DoesNotExist:
        raise Http404('Object not found')

    if request.method == 'GET':
        return JsonResponse(serialize_instance(instance))

    if request.method in ('PUT', 'PATCH'):
        payload = json.loads(request.body.decode('utf-8') or '{}')
        for key, value in payload.items():
            setattr(instance, key, value)
        instance.save()
        return JsonResponse(serialize_instance(instance))

    if request.method == 'DELETE':
        instance.delete()
        return JsonResponse({'detail': 'Deleted'}, status=204)

    return JsonResponse({'detail': 'Method not allowed'}, status=405)
