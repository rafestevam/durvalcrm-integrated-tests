#!/usr/bin/env python3
"""
Script para validar falha de autenticação no Keycloak
Usado pelo playbook Ansible para verificar comportamento esperado
"""

import sys
import json
import requests
from typing import Dict, Tuple

def test_invalid_credentials(keycloak_url: str, realm: str, client_id: str, 
                           email: str, wrong_password: str) -> Tuple[bool, Dict]:
    """
    Testa autenticação com credenciais inválidas
    
    Returns:
        Tuple[bool, Dict]: (teste_passou, detalhes_resposta)
    """
    token_url = f"{keycloak_url}/realms/{realm}/protocol/openid-connect/token"
    
    data = {
        'grant_type': 'password',
        'client_id': client_id,
        'username': email,
        'password': wrong_password
    }
    
    try:
        response = requests.post(token_url, data=data)
        
        # Verificar se a autenticação falhou (esperado)
        if response.status_code in [400, 401]:
            error_data = response.json()
            
            # Verificar se tem os campos de erro esperados
            if 'error' in error_data:
                return True, {
                    'status_code': response.status_code,
                    'error': error_data.get('error'),
                    'error_description': error_data.get('error_description', ''),
                    'message': 'Autenticação falhou como esperado'
                }
        
        # Se chegou aqui, algo está errado (autenticação não deveria ter sucesso)
        return False, {
            'status_code': response.status_code,
            'message': 'ERRO: Autenticação teve sucesso com senha incorreta!',
            'response': response.text
        }
        
    except Exception as e:
        return False, {
            'error': str(e),
            'message': 'Erro ao testar autenticação'
        }

def verify_no_token_generated(response_data: Dict) -> bool:
    """Verifica que nenhum token foi gerado"""
    return 'access_token' not in response_data and 'refresh_token' not in response_data

if __name__ == "__main__":
    if len(sys.argv) != 6:
        print("Uso: validate_auth_failure.py <keycloak_url> <realm> <client_id> <email> <wrong_password>")
        sys.exit(1)
    
    keycloak_url, realm, client_id, email, wrong_password = sys.argv[1:6]
    
    # Executar teste
    success, details = test_invalid_credentials(keycloak_url, realm, client_id, email, wrong_password)
    
    # Imprimir resultado como JSON
    result = {
        'test_passed': success,
        'details': details
    }
    
    print(json.dumps(result, indent=2))
    
    # Retornar código de saída apropriado
    sys.exit(0 if success else 1)