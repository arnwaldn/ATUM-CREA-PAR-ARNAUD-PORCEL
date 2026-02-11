# -*- coding: utf-8 -*-

from . import models
from . import controllers
from . import wizards


def post_init_hook(env):
    """Hook exécuté après installation du module"""
    # Initialisation des données
    pass


def uninstall_hook(env):
    """Hook exécuté avant désinstallation du module"""
    # Nettoyage des données
    pass
